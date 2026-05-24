from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime
import os

app = FastAPI(title="Dann-Alpes Reviews API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["dannalpes"]

hoteles_col  = db["hoteles"]
clientes_col = db["clientes"]
admins_col   = db["administradores"]


# ── HELPERS ──────────────────────────────────────────────────
def parse_id(hotel_id: str):
    try:
        return int(hotel_id)
    except ValueError:
        return hotel_id

def hotel_exists(hotel_id: str):
    h = hoteles_col.find_one({"_id": parse_id(hotel_id)})
    if not h:
        raise HTTPException(status_code=404, detail=f"Hotel '{hotel_id}' no encontrado")
    return h

def parse_nota(valor) -> int:
    try:
        nota = int(valor)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="nota debe ser un entero entre 1 y 5")
    if nota < 1 or nota > 5:
        raise HTTPException(status_code=400, detail="nota debe ser un entero entre 1 y 5")
    return nota


# ── RUTA PRINCIPAL ───────────────────────────────────────────
@app.get("/")
def root():
    return {"estado": "API Dann-Alpes funcionando"}


@app.post("/hoteles/{hotel_id}/resenas")
def crear_resena(hotel_id: str, datos: dict):
    import logging
    try:
        hotel_exists(hotel_id)
        _id = parse_id(hotel_id)

        cliente_id = str(datos.get("clienteId", ""))
        reserva_id = str(datos.get("reservaId", ""))

        if not cliente_id or not reserva_id:
            raise HTTPException(status_code=400, detail="clienteId y reservaId son obligatorios")

        duplicado = hoteles_col.find_one({
            "_id": _id,
            "resenas": {"$elemMatch": {"clienteId": cliente_id, "reservaId": reserva_id}}
        })
        if duplicado:
            raise HTTPException(status_code=409, detail="Ya existe una reseña para esta reserva")

        for campo in ["nota", "resenaRespecitva", "asunto"]:
            if campo not in datos:
                raise HTTPException(status_code=400, detail=f"Campo obligatorio faltante: {campo}")

        nota = parse_nota(datos.get("nota"))
        ahora = datetime.utcnow().isoformat() + "Z"
        resena_id = f"RES_{int(datetime.utcnow().timestamp() * 1000)}"

        nueva_resena = {
            "resenaId":         resena_id,
            "fechaDeCreacion":  ahora[:10],
            "horaDePublicado":  ahora,
            "hotelDeControl":   {"nombreHotel": str(datos.get("nombreHotel", "")), "idHotel": str(hotel_id)},
            "resenaRespecitva": str(datos["resenaRespecitva"]),
            "clienteId":        cliente_id,
            "reservaId":        reserva_id,
            "usuarioPublico":   datos.get("usuarioPublico", {}),
            "nota":             nota,
            "publico":          True,
            "asunto":           str(datos["asunto"]),
            "utilidad":         0,
            "votantes":         [],
            "destacada":        False,
            "respuestas":       []
        }

        resultado = hoteles_col.update_one({"_id": _id}, {"$push": {"resenas": nueva_resena}})
        return {"mensaje": "Reseña creada", "resenaId": resena_id}
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"ERROR crear_resena: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))




# RF2 – Editar reseña
@app.put("/hoteles/{hotel_id}/resenas/{resena_id}")
def editar_resena(hotel_id: str, resena_id: str, datos: dict):
    hotel = hotel_exists(hotel_id)
    _id = parse_id(hotel_id)
    cliente_id = str(datos.get("clienteId", ""))

    resena_existente = next(
        (r for r in hotel.get("resenas", [])
         if r.get("resenaId") == resena_id and r.get("clienteId") == cliente_id),
        None
    )
    if not resena_existente:
        raise HTTPException(status_code=403, detail="Reseña no encontrada o no pertenece al cliente")

    campos = {}
    if "resenaRespecitva" in datos:
        campos["resenas.$[elem].resenaRespecitva"] = str(datos["resenaRespecitva"])
    if "nota" in datos:
        campos["resenas.$[elem].nota"] = parse_nota(datos["nota"])
    if "asunto" in datos:
        campos["resenas.$[elem].asunto"] = str(datos["asunto"])

    if not campos:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    hoteles_col.update_one(
        {"_id": _id}, {"$set": campos},
        array_filters=[{"elem.resenaId": resena_id}]
    )
    return {"mensaje": "Reseña actualizada"}


# RF3 – Eliminar reseña (cliente)
@app.delete("/hoteles/{hotel_id}/resenas/{resena_id}")
def eliminar_resena_cliente(hotel_id: str, resena_id: str, clienteId: str = Query(...)):
    hotel = hotel_exists(hotel_id)
    _id = parse_id(hotel_id)

    resena = next(
        (r for r in hotel.get("resenas", [])
         if r.get("resenaId") == resena_id and r.get("clienteId") == str(clienteId)),
        None
    )
    if not resena:
        raise HTTPException(status_code=403, detail="Reseña no encontrada o no pertenece al cliente")

    hoteles_col.update_one(
        {"_id": _id}, {"$pull": {"resenas": {"resenaId": resena_id}}}
    )
    return {"mensaje": "Reseña eliminada"}


# RF4 – Consultar reseñas (paginadas)
@app.get("/hoteles/{hotel_id}/resenas")
def consultar_resenas(
    hotel_id: str,
    orden: str = Query("fecha", enum=["fecha", "utilidad"]),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(10, ge=1, le=50)
):
    hotel = hotel_exists(hotel_id)
    resenas = [r for r in hotel.get("resenas", []) if r.get("publico", False)]

    if orden == "utilidad":
        resenas.sort(key=lambda r: int(r.get("utilidad", 0)), reverse=True)
    else:
        resenas.sort(key=lambda r: r.get("horaDePublicado", ""), reverse=True)

    destacadas = [r for r in resenas if r.get("destacada")]
    resto      = [r for r in resenas if not r.get("destacada")]
    resenas    = destacadas + resto

    inicio = (pagina - 1) * por_pagina
    pagina_actual = resenas[inicio: inicio + por_pagina]

    resultado = []
    for r in pagina_actual:
        resultado.append({
            "resenaId":         r.get("resenaId"),
            "fechaDeCreacion":  r.get("fechaDeCreacion"),
            "asunto":           r.get("asunto"),
            "resenaRespecitva": r.get("resenaRespecitva"),
            "nota":             int(r.get("nota", 0)),
            "utilidad":         int(r.get("utilidad", 0)),
            "destacada":        bool(r.get("destacada", False)),
            "usuarioPublico":   r.get("usuarioPublico", {}),
            "respuestas":       r.get("respuestas", [])
        })

    return {"total": len(resenas), "pagina": pagina, "por_pagina": por_pagina, "resenas": resultado}


# RF5 – Marcar útil
@app.post("/hoteles/{hotel_id}/resenas/{resena_id}/util")
def marcar_util(hotel_id: str, resena_id: str, datos: dict):
    hotel_exists(hotel_id)
    _id = parse_id(hotel_id)
    cliente_id = str(datos.get("clienteId", ""))

    if not cliente_id:
        raise HTTPException(status_code=400, detail="clienteId requerido")

    ya_voto = hoteles_col.find_one({
        "_id": _id,
        "resenas": {"$elemMatch": {"resenaId": resena_id, "votantes": cliente_id}}
    })
    if ya_voto:
        raise HTTPException(status_code=409, detail="Ya votaste por esta reseña")

    hoteles_col.update_one(
        {"_id": _id},
        {"$inc": {"resenas.$[elem].utilidad": 1}, "$push": {"resenas.$[elem].votantes": cliente_id}},
        array_filters=[{"elem.resenaId": resena_id}]
    )
    return {"mensaje": "Voto registrado"}


# RF6 – Historial cliente
@app.get("/clientes/{cliente_id}/resenas")
def historial_cliente(cliente_id: str, orden: str = Query("fecha", enum=["fecha", "hotel"])):
    pipeline = [
        { "$unwind": "$resenas" },
        { "$match":  { "resenas.clienteId": str(cliente_id) } },
        {
            "$project": {
                "_id": 0,
                "hotel":           "$nombreHotel",
                "idHotel":         "$_id",
                "resenaId":        "$resenas.resenaId",
                "asunto":          "$resenas.asunto",
                "nota":            "$resenas.nota",
                "fechaDeCreacion": "$resenas.fechaDeCreacion",
                "publico":         "$resenas.publico",
                "utilidad":        "$resenas.utilidad",
                "tieneRespuesta":  { "$gt": [{ "$size": { "$ifNull": ["$resenas.respuestas", []] } }, 0] }
            }
        }
    ]
    resultados = list(hoteles_col.aggregate(pipeline))
    if orden == "hotel":
        resultados.sort(key=lambda r: r.get("hotel", ""))
    else:
        resultados.sort(key=lambda r: r.get("fechaDeCreacion", ""), reverse=True)
    return resultados


# RF7 – Responder reseña (admin)
@app.post("/hoteles/{hotel_id}/resenas/{resena_id}/respuesta")
def responder_resena(hotel_id: str, resena_id: str, datos: dict):
    import logging
    hotel_exists(hotel_id)
    _id = parse_id(hotel_id)

    admin_id   = str(datos.get("adminId", ""))
    admin_name = str(datos.get("administrador", ""))
    respuesta  = str(datos.get("respuesta", ""))

    if not all([admin_id, admin_name, respuesta]):
        raise HTTPException(status_code=400, detail="adminId, administrador y respuesta son obligatorios")

    ahora = datetime.utcnow().isoformat() + "Z"
    logging.warning(f"Buscando: _id={_id}, resenaId={resena_id}, adminId={admin_id}")
    hotel = hoteles_col.find_one({"_id": _id, "resenas.resenaId": resena_id, "resenas.respuestas.adminId": admin_id})
    logging.warning(f"hotel encontrado: {hotel is not None}")

    if hotel:
        hoteles_col.update_one(
            {"_id": _id},
            {"$set": {
                "resenas.$[resena].respuestas.$[resp].respuesta": respuesta,
                "resenas.$[resena].respuestas.$[resp].fecha":     ahora
            }},
            array_filters=[{"resena.resenaId": resena_id}, {"resp.adminId": admin_id}]
        )
        return {"mensaje": "Respuesta actualizada"}
    else:
        resultado = hoteles_col.update_one(
            {"_id": _id},
            {"$push": {"resenas.$[elem].respuestas": {
                "respuesta": respuesta, "administrador": admin_name,
                "adminId": admin_id, "fecha": ahora
            }}},
            array_filters=[{"elem.resenaId": resena_id}]
        )
        logging.warning(f"matched: {resultado.matched_count}, modified: {resultado.modified_count}")
        return {"mensaje": "Respuesta agregada"}


# RF8 – Eliminar reseña (admin modera)
@app.delete("/hoteles/{hotel_id}/resenas/{resena_id}/admin")
def eliminar_resena_admin(hotel_id: str, resena_id: str, adminId: str = Query(...)):
    hotel_exists(hotel_id)
    _id = parse_id(hotel_id)

    hotel = hoteles_col.find_one({"_id": _id, "administradorEnControl.idAdmin": str(adminId)})
    if not hotel:
        raise HTTPException(status_code=403, detail="No tienes permiso sobre este hotel")

    resultado = hoteles_col.update_one(
        {"_id": _id}, {"$set": {"resenas.$[elem].publico": False}},
        array_filters=[{"elem.resenaId": resena_id}]
    )
    if resultado.modified_count == 0:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    return {"mensaje": "Reseña ocultada por el administrador"}


# RF9 – Destacar reseña
@app.post("/hoteles/{hotel_id}/resenas/{resena_id}/destacar")
def destacar_resena(hotel_id: str, resena_id: str, datos: dict):
    hotel_exists(hotel_id)
    _id = parse_id(hotel_id)

    admin_id = str(datos.get("adminId", ""))
    hotel_admin = hoteles_col.find_one({"_id": _id, "administradorEnControl.idAdmin": admin_id})
    if not hotel_admin:
        raise HTTPException(status_code=403, detail="No tienes permiso sobre este hotel")

    hoteles_col.update_one({"_id": _id}, {"$set": {"resenas.$[].destacada": False}})
    resultado = hoteles_col.update_one(
        {"_id": _id}, {"$set": {"resenas.$[elem].destacada": True}},
        array_filters=[{"elem.resenaId": resena_id}]
    )
    if resultado.modified_count == 0:
        raise HTTPException(status_code=404, detail="Reseña no encontrada")
    return {"mensaje": f"Reseña '{resena_id}' marcada como destacada"}


# RFC1 – Top 10 hoteles por calificación
@app.get("/consultas/top-hoteles")
def top_hoteles(
    fechaInicio: str = Query(..., description="Formato YYYY-MM-DD"),
    fechaFin:    str = Query(..., description="Formato YYYY-MM-DD")
):
    pipeline = [
        { "$unwind": "$resenas" },
        { "$match": {"resenas.publico": True, "resenas.fechaDeCreacion": {"$gte": fechaInicio, "$lte": fechaFin}} },
        { "$group": {"_id": "$_id", "nombreHotel": {"$first": "$nombreHotel"}, "ciudad": {"$first": "$ciudad"},
                     "calificacionPromedio": {"$avg": "$resenas.nota"}, "totalResenas": {"$sum": 1}} },
        { "$sort": { "calificacionPromedio": -1 } },
        { "$limit": 10 },
        { "$project": {"_id": 0, "idHotel": "$_id", "nombreHotel": 1, "ciudad": 1,
                       "calificacionPromedio": {"$round": ["$calificacionPromedio", 2]}, "totalResenas": 1} }
    ]
    return list(hoteles_col.aggregate(pipeline))


# RFC2 – Evolución mes a mes
@app.get("/consultas/evolucion/{hotel_id}")
def evolucion_hotel(hotel_id: str, anio: int = Query(...)):
    hotel_exists(hotel_id)
    _id = parse_id(hotel_id)
    pipeline = [
        { "$match": { "_id": _id } },
        { "$unwind": "$resenas" },
        { "$match": { "resenas.publico": True } },
        { "$addFields": { "resenas.fechaDt": { "$toDate": "$resenas.horaDePublicado" } } },
        { "$group": {"_id": {"anio": {"$year": "$resenas.fechaDt"}, "mes": {"$month": "$resenas.fechaDt"}},
                     "calificacionPromedio": {"$avg": "$resenas.nota"}, "totalResenas": {"$sum": 1}} },
        { "$match": { "_id.anio": anio } },
        { "$sort":  { "_id.mes": 1 } },
        { "$project": {"_id": 0, "anio": "$_id.anio", "mes": "$_id.mes",
                       "calificacionPromedio": {"$round": ["$calificacionPromedio", 2]}, "totalResenas": 1} }
    ]
    return list(hoteles_col.aggregate(pipeline))


# RFC3 – Perfil comparativo por ciudad
@app.get("/consultas/comparativo")
def comparativo_ciudad(ciudad: str = Query(...)):
    pipeline = [
        { "$match": { "ciudad": str(ciudad) } },
        { "$addFields": { "resenas": { "$ifNull": ["$resenas", []] } } },
        { "$addFields": {
            "resenaPublicas": {"$filter": {"input": "$resenas", "as": "r", "cond": {"$eq": ["$$r.publico", True]}}}
        }},
        { "$addFields": {
            "totalResenas":         {"$size": "$resenaPublicas"},
            "calificacionPromedio": {"$cond": [{"$gt": [{"$size": "$resenaPublicas"}, 0]}, {"$avg": "$resenaPublicas.nota"}, 0]},
            "resenasConRespuesta":  {"$size": {"$filter": {"input": "$resenaPublicas", "as": "r",
                                     "cond": {"$gt": [{"$size": {"$ifNull": ["$$r.respuestas", []]}}, 0]}}}},
            "resenasDestacadas":    {"$size": {"$filter": {"input": "$resenaPublicas", "as": "r",
                                     "cond": {"$eq": ["$$r.destacada", True]}}}}
        }},
        { "$addFields": {
            "porcentajeConRespuesta": {"$cond": [{"$gt": ["$totalResenas", 0]},
                {"$round": [{"$multiply": [{"$divide": ["$resenasConRespuesta", "$totalResenas"]}, 100]}, 1]}, 0]},
            "porcentajeDestacadas":   {"$cond": [{"$gt": ["$totalResenas", 0]},
                {"$round": [{"$multiply": [{"$divide": ["$resenasDestacadas", "$totalResenas"]}, 100]}, 1]}, 0]}
        }},
        { "$facet": {
            "hoteles": [
                {"$project": {"_id": 0, "idHotel": "$_id", "nombreHotel": 1,
                              "calificacionPromedio": {"$round": ["$calificacionPromedio", 2]},
                              "totalResenas": 1, "porcentajeConRespuesta": 1, "porcentajeDestacadas": 1}},
                {"$sort": {"calificacionPromedio": -1}}
            ],
            "promedioDeciudad": [
                {"$group": {"_id": None, "promedio": {"$avg": "$calificacionPromedio"}}},
                {"$project": {"_id": 0, "promedio": {"$round": ["$promedio", 2]}}}
            ]
        }}
    ]
    resultado = list(hoteles_col.aggregate(pipeline))
    if not resultado:
        return {"hoteles": [], "promedioDeciudad": 0}

    data = resultado[0]
    prom_ciudad = data["promedioDeciudad"][0]["promedio"] if data["promedioDeciudad"] else 0
    for h in data["hoteles"]:
        h["bajoPromedio"] = h["calificacionPromedio"] < prom_ciudad

    return {"ciudad": ciudad, "promedioDeciudad": prom_ciudad, "hoteles": data["hoteles"]}
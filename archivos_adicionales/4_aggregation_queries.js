// ============================================================
// ENTREGA 3 – DANN-ALPES
// Actividad 4: Sentencias MongoDB – RFC1, RFC2, RFC3
// ============================================================
// DOCUMENTOS USADOS: colección "hoteles"
// Todos los documentos de hoteles contienen el array embebido
// "resenas", el cual incluye los atributos: nota (int 1–5),
// horaDePublicado (string ISO), fechaDeCreacion (string YYYY-MM-DD),
// publico (bool), respuestas (array), destacada (bool).
// ============================================================

use("dannalpes");

// ──────────────────────────────────────────────────────────────
// RFC1 – Top 10 hoteles con mejor calificación promedio
//         en un período definido
//
// Atributos clave: resenas.nota, resenas.fechaDeCreacion,
//                  resenas.publico, nombreHotel, ciudad
//
// Tipo de agregación: $unwind + $match + $group + $sort + $limit
// Justificación: como las reseñas están embebidas en el hotel,
// $unwind descompone el array para poder operar sobre cada reseña
// individualmente. $group recompone los hoteles calculando el
// promedio con $avg. $limit garantiza exactamente 10 resultados.
// ──────────────────────────────────────────────────────────────

print("\n── RFC1: Top 10 hoteles por calificación promedio ──\n");

const fechaInicio = "2026-01-01";   // ← cambiar según el período requerido
const fechaFin    = "2026-12-31";

db.hoteles.aggregate([
  // 1. Descomponer el array de reseñas
  { $unwind: "$resenas" },

  // 2. Filtrar por período y reseñas públicas
  {
    $match: {
      "resenas.publico": true,
      "resenas.fechaDeCreacion": { $gte: fechaInicio, $lte: fechaFin }
    }
  },

  // 3. Agrupar por hotel y calcular promedio
  {
    $group: {
      _id:                 "$_id",
      nombreHotel:         { $first: "$nombreHotel" },
      ciudad:              { $first: "$ciudad" },
      calificacionPromedio:{ $avg: "$resenas.nota" },
      totalResenas:        { $sum: 1 }
    }
  },

  // 4. Ordenar de mayor a menor calificación
  { $sort: { calificacionPromedio: -1 } },

  // 5. Tomar solo el top 10
  { $limit: 10 },

  // 6. Presentación final
  {
    $project: {
      _id: 0,
      idHotel:              "$_id",
      nombreHotel:          1,
      ciudad:               1,
      calificacionPromedio: { $round: ["$calificacionPromedio", 2] },
      totalResenas:         1
    }
  }
]).forEach(r => printjson(r));


// RFC2 – Evolución de la reputación de un hotel mes a mes
// durante un año determinado

use("dannalpes");

const hotelId  = 48;   // La Terraza – Medellín
const anioBase = 2026;

db.hoteles.aggregate([
  { $match: { _id: hotelId } },
  { $unwind: "$resenas" },
  { $match: { "resenas.publico": true } },
  {
    $addFields: {
      "resenas.fechaDt": { $toDate: "$resenas.horaDePublicado" }
    }
  },
  {
    $group: {
      _id: {
        anio: { $year:  "$resenas.fechaDt" },
        mes:  { $month: "$resenas.fechaDt" }
      },
      calificacionPromedio: { $avg: "$resenas.nota" },
      totalResenas:         { $sum: 1 }
    }
  },
  { $match: { "_id.anio": anioBase } },
  { $sort: { "_id.mes": 1 } },
  {
    $project: {
      _id:  0,
      anio: "$_id.anio",
      mes:  "$_id.mes",
      calificacionPromedio: { $round: ["$calificacionPromedio", 2] },
      totalResenas: 1
    }
  }
]).forEach(r => printjson(r));

// RFC3 – Perfil comparativo de hoteles por ciudad

use("dannalpes");

const ciudadFiltro = "Cartagena";

db.hoteles.aggregate([
  { $match: { ciudad: ciudadFiltro } },
  {
    $addFields: {
      resenas: { $ifNull: ["$resenas", []] }
    }
  },
  {
    $addFields: {
      resenaPublicas: {
        $filter: {
          input: "$resenas",
          as: "r",
          cond: { $eq: ["$$r.publico", true] }
        }
      }
    }
  },
  {
    $addFields: {
      totalResenas: { $size: "$resenaPublicas" },
      calificacionPromedio: {
        $cond: [
          { $gt: [{ $size: "$resenaPublicas" }, 0] },
          { $avg: "$resenaPublicas.nota" },
          0
        ]
      },
      resenasConRespuesta: {
        $size: {
          $filter: {
            input: "$resenaPublicas",
            as: "r",
            cond: { $gt: [{ $size: { $ifNull: ["$$r.respuestas", []] } }, 0] }
          }
        }
      },
      resenasDestacadas: {
        $size: {
          $filter: {
            input: "$resenaPublicas",
            as: "r",
            cond: { $eq: ["$$r.destacada", true] }
          }
        }
      }
    }
  },
  {
    $addFields: {
      porcentajeConRespuesta: {
        $cond: [
          { $gt: ["$totalResenas", 0] },
          { $round: [{ $multiply: [{ $divide: ["$resenasConRespuesta", "$totalResenas"] }, 100] }, 1] },
          0
        ]
      },
      porcentajeDestacadas: {
        $cond: [
          { $gt: ["$totalResenas", 0] },
          { $round: [{ $multiply: [{ $divide: ["$resenasDestacadas", "$totalResenas"] }, 100] }, 1] },
          0
        ]
      }
    }
  },
  {
    $facet: {
      hoteles: [
        {
          $project: {
            _id: 0,
            nombreHotel:            1,
            calificacionPromedio:   { $round: ["$calificacionPromedio", 2] },
            totalResenas:           1,
            porcentajeConRespuesta: 1,
            porcentajeDestacadas:   1
          }
        },
        { $sort: { calificacionPromedio: -1 } }
      ],
      promedioDeciudad: [
        {
          $group: {
            _id: null,
            promedioGeneral: { $avg: "$calificacionPromedio" }
          }
        },
        {
          $project: {
            _id: 0,
            promedioGeneral: { $round: ["$promedioGeneral", 2] }
          }
        }
      ]
    }
  }
]).forEach(r => {
  const promCiudad = r.promedioDeciudad[0]?.promedioGeneral ?? 0;
  print("Promedio de la ciudad (" + ciudadFiltro + "): " + promCiudad);
  print("\nHoteles:");
  r.hoteles.forEach(h => {
    const badge = h.calificacionPromedio < promCiudad ? " ⚠ BAJO PROMEDIO" : "";
    printjson({ ...h, badge });
  });
});

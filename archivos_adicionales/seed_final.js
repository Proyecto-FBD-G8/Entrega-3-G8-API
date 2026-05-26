// ============================================================
// ENTREGA 3 – DANN-ALPES
// seed_final.js – Script completo listo para entregar
// Incluye: desactivar validación + datos + restaurar validación
// Ejecutar en mongosh o MongoDB Compass Shell
// ============================================================

use("dannalpes");

// ── PASO 1: Desactivar validación temporalmente ──────────────
db.runCommand({ collMod: "hoteles",        validator: {}, validationLevel: "off" });
db.runCommand({ collMod: "clientes",       validator: {}, validationLevel: "off" });
db.runCommand({ collMod: "administradores",validator: {}, validationLevel: "off" });
print("✔ Validaciones desactivadas temporalmente");

// ── PASO 2: Limpiar datos anteriores ─────────────────────────
db.administradores.deleteMany({});
db.clientes.deleteMany({});
db.hoteles.deleteMany({});
print("✔ Colecciones limpiadas");

// ── PASO 3: Insertar administradores ─────────────────────────
db.administradores.insertMany([
  { _id: "ADM001", nombreAdmin: "Carlos Ramirez",  contrasenaAdmin: "admin123", emailAdmin: "carlos@dannalpes.com" },
  { _id: "ADM002", nombreAdmin: "Maria Gomez",     contrasenaAdmin: "admin456", emailAdmin: "maria@dannalpes.com"  },
  { _id: "ADM003", nombreAdmin: "Jorge Perez",     contrasenaAdmin: "admin789", emailAdmin: "jorge@dannalpes.com"  }
]);
print("✔ Administradores insertados");

// ── PASO 4: Insertar clientes ─────────────────────────────────
db.clientes.insertMany([
  { _id: "CLI001", nombreUsuario: "Juan Perez",   contrasena: "pass123", email: "juan@gmail.com"  },
  { _id: "CLI002", nombreUsuario: "Ana Torres",   contrasena: "pass456", email: "ana@gmail.com"   },
  { _id: "CLI003", nombreUsuario: "Luis Morales", contrasena: "pass789", email: "luis@gmail.com"  },
  { _id: "CLI004", nombreUsuario: "Sofia Ruiz",   contrasena: "passabc", email: "sofia@gmail.com" },
  { _id: "CLI005", nombreUsuario: "Pedro Vargas", contrasena: "passdef", email: "pedro@gmail.com" }
]);
print("✔ Clientes insertados");

// ── PASO 5: Insertar hoteles con IDs numéricos de Oracle ─────
// Mapeo con Oracle BARES:
//   42 = La Terraza        (Cartagena)
//   46 = El Social         (Bogotá)
//   48 = La Terraza        (Medellín)
//   52 = Café Tropical     (Sincelejo)
//   54 = Punto de Encuentro(Cartagena)

db.hoteles.insertMany([

  // ── ID 42: La Terraza – Cartagena ─────────────────────────
  {
    _id: 42,
    nombreHotel: "La Terraza",
    administradorEnControl: { nombreAdmin: "Carlos Ramirez", idAdmin: "ADM001" },
    ubicacion: "Bocagrande Carrera 1 #10-92",
    ciudad: "Cartagena",
    resenas: [
      {
        resenaId: "RES001",
        fechaDeCreacion: "2026-01-15",
        horaDePublicado: "2026-01-15T10:00:00Z",
        hotelDeControl: { nombreHotel: "La Terraza", idHotel: "42" },
        resenaRespecitva: "Excelente hotel, ubicación perfecta en Bocagrande.",
        clienteId: "CLI001",
        reservaId: "RES_ORACLE_001",
        usuarioPublico: { nombre: "Juan Perez", email: "juan@gmail.com" },
        nota: NumberInt(5),
        publico: true,
        asunto: "Viaje de vacaciones",
        utilidad: NumberInt(12),
        votantes: ["CLI002","CLI003"],
        destacada: true,
        respuestas: [{ respuesta: "Gracias, fue un placer recibirle.", administrador: "Carlos Ramirez", adminId: "ADM001", fecha: "2026-01-16T09:00:00Z" }]
      },
      {
        resenaId: "RES002",
        fechaDeCreacion: "2026-02-10",
        horaDePublicado: "2026-02-10T14:30:00Z",
        hotelDeControl: { nombreHotel: "La Terraza", idHotel: "42" },
        resenaRespecitva: "Las habitaciones son amplias y el desayuno muy completo.",
        clienteId: "CLI002",
        reservaId: "RES_ORACLE_002",
        usuarioPublico: { nombre: "Ana Torres", email: "ana@gmail.com" },
        nota: NumberInt(4),
        publico: true,
        asunto: "Estadía familiar",
        utilidad: NumberInt(7),
        votantes: ["CLI001"],
        destacada: false,
        respuestas: []
      },
      {
        resenaId: "RES003",
        fechaDeCreacion: "2026-03-05",
        horaDePublicado: "2026-03-05T08:00:00Z",
        hotelDeControl: { nombreHotel: "La Terraza", idHotel: "42" },
        resenaRespecitva: "El servicio de piscina fue increíble, definitivamente volvería.",
        clienteId: "CLI003",
        reservaId: "RES_ORACLE_003",
        usuarioPublico: { nombre: "Luis Morales", email: "luis@gmail.com" },
        nota: NumberInt(5),
        publico: true,
        asunto: "Luna de miel",
        utilidad: NumberInt(20),
        votantes: ["CLI001","CLI002","CLI004"],
        destacada: false,
        respuestas: [{ respuesta: "Nos alegra que hayan disfrutado.", administrador: "Carlos Ramirez", adminId: "ADM001", fecha: "2026-03-06T10:00:00Z" }]
      },
      {
        resenaId: "RES004",
        fechaDeCreacion: "2026-04-20",
        horaDePublicado: "2026-04-20T19:00:00Z",
        hotelDeControl: { nombreHotel: "La Terraza", idHotel: "42" },
        resenaRespecitva: "El Wi-Fi era lento pero el resto del servicio fue excelente.",
        clienteId: "CLI004",
        reservaId: "RES_ORACLE_004",
        usuarioPublico: { nombre: "Sofia Ruiz", email: "sofia@gmail.com" },
        nota: NumberInt(4),
        publico: true,
        asunto: "Trabajo remoto",
        utilidad: NumberInt(5),
        votantes: [],
        destacada: false,
        respuestas: []
      }
    ]
  },

  // ── ID 46: El Social – Bogotá ─────────────────────────────
  {
    _id: 46,
    nombreHotel: "El Social",
    administradorEnControl: { nombreAdmin: "Maria Gomez", idAdmin: "ADM002" },
    ubicacion: "Carrera 15 #118-30",
    ciudad: "Bogota",
    resenas: [
      {
        resenaId: "RES005",
        fechaDeCreacion: "2026-01-22",
        horaDePublicado: "2026-01-22T11:00:00Z",
        hotelDeControl: { nombreHotel: "El Social", idHotel: "46" },
        resenaRespecitva: "Buen hotel para viajes de negocios, tranquilo y bien ubicado.",
        clienteId: "CLI005",
        reservaId: "RES_ORACLE_005",
        usuarioPublico: { nombre: "Pedro Vargas", email: "pedro@gmail.com" },
        nota: NumberInt(4),
        publico: true,
        asunto: "Viaje ejecutivo",
        utilidad: NumberInt(3),
        votantes: [],
        destacada: false,
        respuestas: []
      },
      {
        resenaId: "RES006",
        fechaDeCreacion: "2026-02-28",
        horaDePublicado: "2026-02-28T16:00:00Z",
        hotelDeControl: { nombreHotel: "El Social", idHotel: "46" },
        resenaRespecitva: "El parqueadero es complicado, pero la atención compensa.",
        clienteId: "CLI001",
        reservaId: "RES_ORACLE_006",
        usuarioPublico: { nombre: "Juan Perez", email: "juan@gmail.com" },
        nota: NumberInt(3),
        publico: true,
        asunto: "Visita rápida",
        utilidad: NumberInt(8),
        votantes: ["CLI003"],
        destacada: true,
        respuestas: [{ respuesta: "Estamos trabajando en ampliar el parqueadero.", administrador: "Maria Gomez", adminId: "ADM002", fecha: "2026-03-01T09:00:00Z" }]
      }
    ]
  },

  // ── ID 48: La Terraza – Medellín ──────────────────────────
  {
    _id: 48,
    nombreHotel: "La Terraza",
    administradorEnControl: { nombreAdmin: "Carlos Ramirez", idAdmin: "ADM001" },
    ubicacion: "Carrera 43A #7-50",
    ciudad: "Medellin",
    resenas: [
      {
        resenaId: "RES007",
        fechaDeCreacion: "2026-01-08",
        horaDePublicado: "2026-01-08T09:00:00Z",
        hotelDeControl: { nombreHotel: "La Terraza", idHotel: "48" },
        resenaRespecitva: "El mejor hotel de Medellín, vista al Poblado espectacular.",
        clienteId: "CLI002",
        reservaId: "RES_ORACLE_007",
        usuarioPublico: { nombre: "Ana Torres", email: "ana@gmail.com" },
        nota: NumberInt(5),
        publico: true,
        asunto: "Vacaciones",
        utilidad: NumberInt(30),
        votantes: ["CLI001","CLI003","CLI004","CLI005"],
        destacada: true,
        respuestas: [{ respuesta: "¡Muchas gracias! Nos vemos pronto.", administrador: "Carlos Ramirez", adminId: "ADM001", fecha: "2026-01-09T08:00:00Z" }]
      },
      {
        resenaId: "RES008",
        fechaDeCreacion: "2026-02-14",
        horaDePublicado: "2026-02-14T20:00:00Z",
        hotelDeControl: { nombreHotel: "La Terraza", idHotel: "48" },
        resenaRespecitva: "Perfecto para celebrar San Valentín, muy romántico.",
        clienteId: "CLI003",
        reservaId: "RES_ORACLE_008",
        usuarioPublico: { nombre: "Luis Morales", email: "luis@gmail.com" },
        nota: NumberInt(5),
        publico: true,
        asunto: "San Valentín",
        utilidad: NumberInt(15),
        votantes: ["CLI001","CLI002"],
        destacada: false,
        respuestas: []
      },
      {
        resenaId: "RES009",
        fechaDeCreacion: "2026-03-20",
        horaDePublicado: "2026-03-20T12:00:00Z",
        hotelDeControl: { nombreHotel: "La Terraza", idHotel: "48" },
        resenaRespecitva: "El restaurante no cumplió mis expectativas, aunque la habitación sí.",
        clienteId: "CLI004",
        reservaId: "RES_ORACLE_009",
        usuarioPublico: { nombre: "Sofia Ruiz", email: "sofia@gmail.com" },
        nota: NumberInt(3),
        publico: true,
        asunto: "Estadía de trabajo",
        utilidad: NumberInt(4),
        votantes: [],
        destacada: false,
        respuestas: [{ respuesta: "Hemos mejorado el menú.", administrador: "Carlos Ramirez", adminId: "ADM001", fecha: "2026-03-21T10:00:00Z" }]
      }
    ]
  },

  // ── ID 52: Café Tropical – Sincelejo ──────────────────────
  {
    _id: 52,
    nombreHotel: "Café Tropical",
    administradorEnControl: { nombreAdmin: "Maria Gomez", idAdmin: "ADM002" },
    ubicacion: "Calle 20 #15-40",
    ciudad: "Sincelejo",
    resenas: [
      {
        resenaId: "RES010",
        fechaDeCreacion: "2026-01-30",
        horaDePublicado: "2026-01-30T06:00:00Z",
        hotelDeControl: { nombreHotel: "Café Tropical", idHotel: "52" },
        resenaRespecitva: "Funcional para estadías cortas, buen precio.",
        clienteId: "CLI005",
        reservaId: "RES_ORACLE_010",
        usuarioPublico: { nombre: "Pedro Vargas", email: "pedro@gmail.com" },
        nota: NumberInt(4),
        publico: true,
        asunto: "Viaje rápido",
        utilidad: NumberInt(22),
        votantes: ["CLI001","CLI002","CLI003"],
        destacada: false,
        respuestas: []
      },
      {
        resenaId: "RES011",
        fechaDeCreacion: "2026-02-05",
        horaDePublicado: "2026-02-05T07:30:00Z",
        hotelDeControl: { nombreHotel: "Café Tropical", idHotel: "52" },
        resenaRespecitva: "Las instalaciones necesitan mantenimiento.",
        clienteId: "CLI001",
        reservaId: "RES_ORACLE_011",
        usuarioPublico: { nombre: "Juan Perez", email: "juan@gmail.com" },
        nota: NumberInt(2),
        publico: true,
        asunto: "Estadía de paso",
        utilidad: NumberInt(9),
        votantes: ["CLI004"],
        destacada: false,
        respuestas: [{ respuesta: "Estamos mejorando las instalaciones.", administrador: "Maria Gomez", adminId: "ADM002", fecha: "2026-02-06T08:00:00Z" }]
      }
    ]
  },

  // ── ID 54: Punto de Encuentro – Cartagena ─────────────────
  {
    _id: 54,
    nombreHotel: "Punto de Encuentro",
    administradorEnControl: { nombreAdmin: "Jorge Perez", idAdmin: "ADM003" },
    ubicacion: "Centro Histórico Calle 5 #3-20",
    ciudad: "Cartagena",
    resenas: [
      {
        resenaId: "RES012",
        fechaDeCreacion: "2026-01-05",
        horaDePublicado: "2026-01-05T15:00:00Z",
        hotelDeControl: { nombreHotel: "Punto de Encuentro", idHotel: "54" },
        resenaRespecitva: "Ubicación privilegiada en el centro histórico, muy recomendado.",
        clienteId: "CLI003",
        reservaId: "RES_ORACLE_012",
        usuarioPublico: { nombre: "Luis Morales", email: "luis@gmail.com" },
        nota: NumberInt(5),
        publico: true,
        asunto: "Año nuevo",
        utilidad: NumberInt(45),
        votantes: ["CLI001","CLI002","CLI004","CLI005"],
        destacada: true,
        respuestas: [{ respuesta: "¡Feliz año nuevo! Bienvenido cuando quiera.", administrador: "Jorge Perez", adminId: "ADM003", fecha: "2026-01-06T09:00:00Z" }]
      },
      {
        resenaId: "RES013",
        fechaDeCreacion: "2026-02-20",
        horaDePublicado: "2026-02-20T18:00:00Z",
        hotelDeControl: { nombreHotel: "Punto de Encuentro", idHotel: "54" },
        resenaRespecitva: "El calor es intenso pero el AC funciona bien.",
        clienteId: "CLI004",
        reservaId: "RES_ORACLE_013",
        usuarioPublico: { nombre: "Sofia Ruiz", email: "sofia@gmail.com" },
        nota: NumberInt(4),
        publico: true,
        asunto: "Carnaval",
        utilidad: NumberInt(11),
        votantes: ["CLI001"],
        destacada: false,
        respuestas: []
      },
      {
        resenaId: "RES014",
        fechaDeCreacion: "2026-03-15",
        horaDePublicado: "2026-03-15T10:00:00Z",
        hotelDeControl: { nombreHotel: "Punto de Encuentro", idHotel: "54" },
        resenaRespecitva: "Las fotos del sitio web son más bonitas que la realidad.",
        clienteId: "CLI002",
        reservaId: "RES_ORACLE_014",
        usuarioPublico: { nombre: "Ana Torres", email: "ana@gmail.com" },
        nota: NumberInt(3),
        publico: false,
        asunto: "Semana santa",
        utilidad: NumberInt(0),
        votantes: [],
        destacada: false,
        respuestas: []
      }
    ]
  }
]);
print("✔ Hoteles insertados con IDs de Oracle");

// ── PASO 6: Restaurar esquemas de validación ─────────────────

db.runCommand({
  collMod: "administradores",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombreAdmin", "contrasenaAdmin", "emailAdmin"],
      additionalProperties: true,
      properties: {
        nombreAdmin:     { bsonType: "string", minLength: 2 },
        contrasenaAdmin: { bsonType: "string", minLength: 6 },
        emailAdmin:      { bsonType: "string", pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});
print("✔ Validación restaurada: administradores");

db.runCommand({
  collMod: "clientes",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombreUsuario", "contrasena", "email"],
      additionalProperties: true,
      properties: {
        nombreUsuario: { bsonType: "string", minLength: 2 },
        contrasena:    { bsonType: "string", minLength: 6 },
        email:         { bsonType: "string", pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});
print("✔ Validación restaurada: clientes");

db.runCommand({
  collMod: "hoteles",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombreHotel", "administradorEnControl", "ubicacion", "ciudad"],
      additionalProperties: true,
      properties: {
        nombreHotel: { bsonType: "string" },
        administradorEnControl: {
          bsonType: "object",
          required: ["nombreAdmin", "idAdmin"],
          properties: {
            nombreAdmin: { bsonType: "string" },
            idAdmin:     { bsonType: "string" }
          }
        },
        ubicacion: { bsonType: "string" },
        ciudad:    { bsonType: "string" },
        resenas: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["fechaDeCreacion","horaDePublicado","resenaRespecitva","clienteId","nota","publico","asunto"],
            properties: {
              fechaDeCreacion:  { bsonType: "string" },
              horaDePublicado:  { bsonType: "string" },
              resenaRespecitva: { bsonType: "string", minLength: 1 },
              clienteId:        { bsonType: "string" },
              nota:             { bsonType: "int", minimum: 1, maximum: 5 },
              publico:          { bsonType: "bool" },
              asunto:           { bsonType: "string" },
              utilidad:         { bsonType: "int", minimum: 0 },
              votantes:         { bsonType: "array", items: { bsonType: "string" } },
              destacada:        { bsonType: "bool" },
              reservaId:        { bsonType: "string" },
              respuestas: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["respuesta","administrador"],
                  properties: {
                    respuesta:     { bsonType: "string", minLength: 1 },
                    administrador: { bsonType: "string" },
                    adminId:       { bsonType: "string" },
                    fecha:         { bsonType: "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});
print("✔ Validación restaurada: hoteles");

// ── RESUMEN FINAL ─────────────────────────────────────────────
print("\n── Resumen ──────────────────────────────────");
print("Administradores: " + db.administradores.countDocuments());
print("Clientes:        " + db.clientes.countDocuments());
print("Hoteles:         " + db.hoteles.countDocuments());
print("\n✔ seed_final.js ejecutado correctamente");

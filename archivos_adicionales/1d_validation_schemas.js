// ============================================================
// ENTREGA 3 – DANN-ALPES
// 1d: Esquemas de validación ($jsonSchema) para cada colección
// Ejecutar en mongosh o MongoDB Compass Shell
// ============================================================

use("dannalpes");

// ── 1. VALIDACIÓN: ADMINISTRADORES ──────────────────────────
db.runCommand({
  collMod: "administradores",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombreAdmin", "contrasenaAdmin", "emailAdmin"],
      additionalProperties: true,
      properties: {
        nombreAdmin: {
          bsonType: "string",
          minLength: 2,
          description: "Nombre del administrador – requerido, string"
        },
        contrasenaAdmin: {
          bsonType: "string",
          minLength: 6,
          description: "Contraseña del administrador – requerida, mínimo 6 caracteres"
        },
        emailAdmin: {
          bsonType: "string",
          pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
          description: "Email del administrador – requerido, formato válido"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});
print("✔ Validación aplicada a 'administradores'");

// ── 2. VALIDACIÓN: CLIENTES ──────────────────────────────────
db.runCommand({
  collMod: "clientes",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombreUsuario", "contrasena", "email"],
      additionalProperties: true,
      properties: {
        nombreUsuario: {
          bsonType: "string",
          minLength: 2,
          description: "Nombre de usuario – requerido, string"
        },
        contrasena: {
          bsonType: "string",
          minLength: 6,
          description: "Contraseña – requerida, mínimo 6 caracteres"
        },
        email: {
          bsonType: "string",
          pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
          description: "Email del cliente – requerido, formato válido"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});
print("✔ Validación aplicada a 'clientes'");

// ── 3. VALIDACIÓN: HOTELES (incluye reseñas embebidas) ───────
db.runCommand({
  collMod: "hoteles",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombreHotel", "administradorEnControl", "ubicacion", "ciudad"],
      additionalProperties: true,
      properties: {
        nombreHotel: {
          bsonType: "string",
          description: "Nombre del hotel – requerido"
        },
        administradorEnControl: {
          bsonType: "object",
          required: ["nombreAdmin", "idAdmin"],
          properties: {
            nombreAdmin: { bsonType: "string" },
            idAdmin:     { bsonType: "string" }
          },
          description: "Referencia al administrador – requerida"
        },
        ubicacion: {
          bsonType: "string",
          description: "Dirección del hotel – requerida"
        },
        ciudad: {
          bsonType: "string",
          description: "Ciudad del hotel – requerida"
        },
        // ── Array de reseñas embebidas ──────────────────────
        resenas: {
          bsonType: "array",
          description: "Lista de reseñas embebidas en el hotel",
          items: {
            bsonType: "object",
            required: [
              "fechaDeCreacion",
              "horaDePublicado",
              "resenaRespecitva",
              "clienteId",
              "nota",
              "publico",
              "asunto"
            ],
            properties: {
              fechaDeCreacion: {
                bsonType: "string",
                description: "Fecha de creación (YYYY-MM-DD) – requerida"
              },
              horaDePublicado: {
                bsonType: "string",
                description: "Timestamp ISO de publicación – requerido"
              },
              hotelDeControl: {
                bsonType: "object",
                properties: {
                  nombreHotel: { bsonType: "string" },
                  idHotel:     { bsonType: "string" }
                }
              },
              resenaRespecitva: {
                bsonType: "string",
                minLength: 1,
                description: "Texto de la reseña – requerido, no vacío"
              },
              clienteId: {
                bsonType: "string",
                description: "ID del cliente autor – requerido (referencia a clientes)"
              },
              usuarioPublico: {
                bsonType: "object",
                properties: {
                  nombre: { bsonType: "string" },
                  email:  { bsonType: "string" }
                }
              },
              nota: {
                bsonType: "int",
                minimum: 1,
                maximum: 5,
                description: "Calificación entre 1 y 5 – requerida"
              },
              publico: {
                bsonType: "bool",
                description: "Visibilidad pública – requerida"
              },
              asunto: {
                bsonType: "string",
                description: "Asunto/título de la reseña – requerido"
              },
              utilidad: {
                bsonType: "int",
                minimum: 0,
                description: "Contador de votos útiles"
              },
              votantes: {
                bsonType: "array",
                description: "IDs de clientes que votaron (evita doble voto)",
                items: { bsonType: "string" }
              },
              destacada: {
                bsonType: "bool",
                description: "true si el admin la destacó"
              },
              reservaId: {
                bsonType: "string",
                description: "ID de la reserva Oracle que habilita esta reseña"
              },
              respuestas: {
                bsonType: "array",
                description: "Respuestas del administrador (embebidas)",
                items: {
                  bsonType: "object",
                  required: ["respuesta", "administrador"],
                  properties: {
                    respuesta:      { bsonType: "string", minLength: 1 },
                    administrador:  { bsonType: "string" },
                    adminId:        { bsonType: "string" },
                    fecha:          { bsonType: "string" }
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
print("✔ Validación aplicada a 'hoteles'");

print("\nEsquemas de validación configurados correctamente.");

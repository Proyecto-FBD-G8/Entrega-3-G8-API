// ============================================================
// ENTREGA 3 – DANN-ALPES
// 1c: Creación de colecciones principales en MongoDB
// Ejecutar en mongosh o MongoDB Compass Shell
// ============================================================

use("dannalpes");

// ── 1. ADMINISTRADORES ──────────────────────────────────────
db.createCollection("administradores");
print("✔ Colección 'administradores' creada");

// ── 2. CLIENTES ─────────────────────────────────────────────
db.createCollection("clientes");
print("✔ Colección 'clientes' creada");

// ── 3. HOTELES (contiene reseñas embebidas) ─────────────────
db.createCollection("hoteles");
print("✔ Colección 'hoteles' creada");

print("\nColecciones principales listas en la BD 'dannalpes'.");

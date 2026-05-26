// ============================================================
// ENTREGA 3 – DANN-ALPES
// Escenario de prueba: insertar documentos que VIOLAN el esquema
// (para evidenciar que la validación funciona)
// ============================================================

use("dannalpes");

print("── PRUEBA 1: Cliente sin email (campo requerido faltante) ──");
try {
  db.clientes.insertOne({
    nombreUsuario: "Error User",
    contrasena: "abc123"
    // email FALTA → debe lanzar error
  });
  print("ERROR: Se insertó sin email – la validación no funcionó");
} catch (e) {
  print("✔ Error esperado: " + e.message);
}

print("\n── PRUEBA 2: Reseña con nota fuera de rango (nota = 7) ──");
try {
  db.hoteles.updateOne(
    { _id: "HOT001" },
    {
      $push: {
        resenas: {
          fechaDeCreacion: "2026-05-23",
          horaDePublicado: "2026-05-23T10:00:00Z",
          resenaRespecitva: "Prueba de nota inválida",
          clienteId: "CLI001",
          nota: NumberInt(7),   // ← INVÁLIDO: máximo es 5
          publico: true,
          asunto: "Test inválido"
        }
      }
    }
  );
  print("ERROR: Se insertó con nota=7 – la validación no funcionó");
} catch (e) {
  print("✔ Error esperado: " + e.message);
}

print("\n── PRUEBA 3: Reseña con texto vacío (minLength = 1) ──");
try {
  db.hoteles.updateOne(
    { _id: "HOT001" },
    {
      $push: {
        resenas: {
          fechaDeCreacion: "2026-05-23",
          horaDePublicado: "2026-05-23T11:00:00Z",
          resenaRespecitva: "",   // ← INVÁLIDO: minLength 1
          clienteId: "CLI002",
          nota: NumberInt(3),
          publico: true,
          asunto: "Test texto vacío"
        }
      }
    }
  );
  print("ERROR: Se insertó con texto vacío – la validación no funcionó");
} catch (e) {
  print("✔ Error esperado: " + e.message);
}

print("\n── PRUEBA 4: Administrador con email inválido ──");
try {
  db.administradores.insertOne({
    nombreAdmin: "Falso Admin",
    contrasenaAdmin: "pass123",
    emailAdmin: "no-es-un-email"   // ← INVÁLIDO: no cumple el patrón
  });
  print("ERROR: Se insertó con email inválido – la validación no funcionó");
} catch (e) {
  print("✔ Error esperado: " + e.message);
}

print("\nPruebas de validación completadas.");

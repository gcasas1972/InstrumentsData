import { isAdminRequest } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return Response.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }
  } catch (error) {
    console.error("No se pudo validar la sesión de administración.", error);
    return Response.json(
      { error: "La autenticación no está configurada correctamente en el servidor." },
      { status: 500 },
    );
  }

  try {
    const db = getDb();
    const records = await db`
      SELECT
        id::text AS id,
        person_name AS "personName",
        instrument_name AS "instrumentName",
        part_number AS "partNumber",
        serial_number AS "serialNumber",
        photo_url AS "photoUrl",
        created_at AS "createdAt"
      FROM instrument_records
      ORDER BY created_at DESC, id DESC
    `;
    return Response.json({ records }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("No se pudieron cargar los registros de instrumentos.", error);
    return Response.json(
      { error: "No se pudieron cargar los registros. Revisa DATABASE_URL y la tabla de Neon." },
      { status: 500 },
    );
  }
}

import { get } from "@vercel/blob";
import { isAdminRequest } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  if (!/^[1-9]\d*$/.test(id)) {
    return Response.json({ error: "El identificador del registro no es válido." }, { status: 400 });
  }

  try {
    const db = getDb();
    const records = await db`
      SELECT photo_url
      FROM instrument_records
      WHERE id = ${id}
      LIMIT 1
    `;
    if (records.length === 0) {
      return Response.json({ error: "No se encontró el registro." }, { status: 404 });
    }

    const blob = await get(records[0].photo_url as string, { access: "private" });
    if (!blob) {
      return Response.json({ error: "No se encontró la foto." }, { status: 404 });
    }
    if (blob.statusCode !== 200) {
      return new Response(null, { status: blob.statusCode });
    }
    return new Response(blob.stream, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "Content-Type": blob.blob.contentType,
      },
    });
  } catch (error) {
    console.error("No se pudo cargar la foto del instrumento.", error);
    return Response.json({ error: "No se pudo cargar la foto." }, { status: 500 });
  }
}

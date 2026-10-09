import { del, put } from "@vercel/blob";
import { isAdminRequest } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { validateInstrumentFields, validateInstrumentPhoto } from "@/lib/instrument-validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function isValidId(id: string) {
  return /^[1-9]\d*$/.test(id);
}

export async function PATCH(request: Request, context: RouteContext) {
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
  if (!isValidId(id)) {
    return Response.json({ error: "El identificador del registro no es válido." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "El formulario enviado no es válido." }, { status: 400 });
  }

  const fields = validateInstrumentFields(formData);
  if (!fields.ok) return Response.json({ error: fields.error }, { status: 400 });

  const photo = validateInstrumentPhoto(formData.get("photo"), false);
  if (!photo.ok) return Response.json({ error: photo.error }, { status: 400 });

  let newPhotoUrl: string | undefined;
  let previousPhotoUrl: string | undefined;
  try {
    const db = getDb();
    const existing = await db`
      SELECT photo_url AS "photoUrl"
      FROM instrument_records
      WHERE id = ${id}
      LIMIT 1
    `;
    if (existing.length === 0) {
      return Response.json({ error: "No se encontró el registro." }, { status: 404 });
    }
    previousPhotoUrl = existing[0].photoUrl as string;

    if (photo.photo) {
      const blob = await put(
        `instrument-photos/${crypto.randomUUID()}.${photo.extension}`,
        photo.photo,
        { access: "private", contentType: photo.photo.type },
      );
      newPhotoUrl = blob.url;
    }

    if (newPhotoUrl) {
      await db`
        UPDATE instrument_records
        SET person_name = ${fields.values[0]},
            instrument_name = ${fields.values[1]},
            part_number = ${fields.values[2]},
            serial_number = ${fields.values[3]},
            photo_url = ${newPhotoUrl}
        WHERE id = ${id}
      `;
    } else {
      await db`
        UPDATE instrument_records
        SET person_name = ${fields.values[0]},
            instrument_name = ${fields.values[1]},
            part_number = ${fields.values[2]},
            serial_number = ${fields.values[3]}
        WHERE id = ${id}
      `;
    }
  } catch (error) {
    if (newPhotoUrl) {
      try {
        await del(newPhotoUrl);
      } catch (cleanupError) {
        console.error("No se pudo eliminar la nueva foto tras fallar la edición.", cleanupError);
      }
    }
    console.error("No se pudo modificar el registro del instrumento.", error);
    return Response.json({ error: "No se pudo modificar el registro." }, { status: 500 });
  }

  if (newPhotoUrl && previousPhotoUrl) {
    try {
      await del(previousPhotoUrl);
    } catch (error) {
      console.error("No se pudo eliminar la foto anterior tras modificar el registro.", error);
      return Response.json({
        message: "Registro actualizado, pero no se pudo eliminar la foto anterior.",
      });
    }
  }

  return Response.json({ message: "Registro actualizado correctamente." });
}

export async function DELETE(request: Request, context: RouteContext) {
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
  if (!isValidId(id)) {
    return Response.json({ error: "El identificador del registro no es válido." }, { status: 400 });
  }

  let photoUrl: string | undefined;
  try {
    const db = getDb();
    const deleted = await db`
      DELETE FROM instrument_records
      WHERE id = ${id}
      RETURNING photo_url AS "photoUrl"
    `;
    if (deleted.length === 0) {
      return Response.json({ error: "No se encontró el registro." }, { status: 404 });
    }
    photoUrl = deleted[0].photoUrl as string;
  } catch (error) {
    console.error("No se pudo eliminar el registro del instrumento.", error);
    return Response.json({ error: "No se pudo eliminar el registro." }, { status: 500 });
  }

  try {
    await del(photoUrl);
  } catch (error) {
    console.error("No se pudo eliminar la foto tras eliminar el registro.", error);
    return Response.json({
      message: "Registro eliminado, pero no se pudo eliminar su foto.",
    });
  }

  return Response.json({ message: "Registro eliminado correctamente." });
}

import { del, put } from "@vercel/blob";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxPhotoSize = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Debes iniciar sesión para guardar registros." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "El formulario enviado no es válido." }, { status: 400 });
  }

  const personName = formData.get("personName");
  const instrumentName = formData.get("instrumentName");
  const partNumber = formData.get("partNumber");
  const serialNumber = formData.get("serialNumber");
  const photo = formData.get("photo");

  const textFields = [personName, instrumentName, partNumber, serialNumber];
  if (textFields.some((value) => typeof value !== "string" || !value.trim())) {
    return Response.json({ error: "Completa todos los campos." }, { status: 400 });
  }

  if (
    typeof personName !== "string" ||
    typeof instrumentName !== "string" ||
    typeof partNumber !== "string" ||
    typeof serialNumber !== "string"
  ) {
    return Response.json({ error: "Los datos del formulario no son válidos." }, { status: 400 });
  }

  const values = [personName, instrumentName, partNumber, serialNumber].map((value) => value.trim());
  const maxLengths = [120, 160, 120, 120];
  if (values.some((value, index) => value.length > maxLengths[index])) {
    return Response.json({ error: "Uno o más campos superan el largo permitido." }, { status: 400 });
  }

  if (!(photo instanceof File) || photo.size === 0) {
    return Response.json({ error: "Selecciona una foto del instrumento." }, { status: 400 });
  }

  const extension = allowedImageTypes.get(photo.type);
  if (!extension) {
    return Response.json(
      { error: "La foto debe estar en formato JPG, PNG o WebP." },
      { status: 400 },
    );
  }

  if (photo.size > maxPhotoSize) {
    return Response.json({ error: "La foto no puede superar los 4 MB." }, { status: 400 });
  }

  let photoUrl: string | undefined;
  try {
    const blob = await put(`instrument-photos/${crypto.randomUUID()}.${extension}`, photo, {
      access: "public",
      contentType: photo.type,
    });
    photoUrl = blob.url;

    const db = getDb();
    await db`
      INSERT INTO instrument_records
        (person_name, instrument_name, part_number, serial_number, photo_url)
      VALUES
        (${values[0]}, ${values[1]}, ${values[2]}, ${values[3]}, ${photoUrl})
    `;

    return Response.json({ message: "Registro guardado correctamente." }, { status: 201 });
  } catch (error) {
    if (photoUrl) {
      try {
        await del(photoUrl);
      } catch (cleanupError) {
        console.error("No se pudo eliminar la foto tras fallar el guardado.", cleanupError);
      }
    }

    console.error("No se pudo guardar el registro del instrumento.", error);
    return Response.json(
      { error: "No se pudo guardar el registro. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}

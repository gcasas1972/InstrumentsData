const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxPhotoSize = 4 * 1024 * 1024;

export type InstrumentValues = [string, string, string, string];

export function validateInstrumentFields(
  formData: FormData,
): { ok: true; values: InstrumentValues } | { ok: false; error: string } {
  const fields = [
    formData.get("personName"),
    formData.get("instrumentName"),
    formData.get("partNumber"),
    formData.get("serialNumber"),
  ];

  if (fields.some((value) => typeof value !== "string" || !value.trim())) {
    return { ok: false, error: "Completa todos los campos." };
  }

  const values = fields.map((value) => (value as string).trim()) as InstrumentValues;
  const maxLengths = [120, 160, 120, 120];
  if (values.some((value, index) => value.length > maxLengths[index])) {
    return { ok: false, error: "Uno o más campos superan el largo permitido." };
  }

  return { ok: true, values };
}

export function validateInstrumentPhoto(
  value: FormDataEntryValue | null,
  required: boolean,
):
  | { ok: true; photo?: File; extension?: string }
  | { ok: false; error: string } {
  if (!(value instanceof File) || value.size === 0) {
    return required
      ? { ok: false, error: "Selecciona una foto del instrumento." }
      : { ok: true };
  }

  const extension = allowedImageTypes.get(value.type);
  if (!extension) {
    return { ok: false, error: "La foto debe estar en formato JPG, PNG o WebP." };
  }

  if (value.size > maxPhotoSize) {
    return { ok: false, error: "La foto no puede superar los 4 MB." };
  }

  return { ok: true, photo: value, extension };
}

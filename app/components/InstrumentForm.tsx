"use client";

import { FormEvent, useRef, useState } from "react";

export function InstrumentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/instruments", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(result.error ?? "No se pudo guardar el registro.");
        return;
      }

      formRef.current?.reset();
      setMessage(result.message ?? "Registro guardado correctamente.");
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form ref={formRef} className="record-form" onSubmit={handleSubmit}>
      <label>
        Nombre de la persona
        <input name="personName" type="text" maxLength={120} autoComplete="name" required />
      </label>

      <label>
        Nombre del instrumento
        <input name="instrumentName" type="text" maxLength={160} required />
      </label>

      <div className="field-row">
        <label>
          Número de parte
          <input name="partNumber" type="text" maxLength={120} required />
        </label>

        <label>
          Número de serie
          <input name="serialNumber" type="text" maxLength={120} required />
        </label>
      </div>

      <label>
        Foto del instrumento
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
        <span className="field-hint">JPG, PNG o WebP; máximo 4 MB. La foto se almacena en Vercel Blob.</span>
      </label>

      <button className="primary-button" type="submit" disabled={isSaving}>
        {isSaving ? "Guardando..." : "Guardar registro"}
      </button>

      <p className="status-message" aria-live="polite" role={error ? "alert" : "status"}>
        {error || message}
      </p>
    </form>
  );
}

"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type InstrumentRecord = {
  id: string;
  personName: string;
  instrumentName: string;
  partNumber: string;
  serialNumber: string;
  createdAt: string;
};

type ApiResult = { error?: string; message?: string };

export function AdminRecords() {
  const [records, setRecords] = useState<InstrumentRecord[]>([]);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRecords = useCallback(async () => {
    const response = await fetch("/api/admin/instruments", { cache: "no-store" });
    const result = (await response.json()) as ApiResult & { records?: InstrumentRecord[] };
    if (!response.ok) {
      if (response.status !== 401) setError(result.error ?? "No se pudieron cargar los registros.");
      return false;
    }
    setRecords(result.records ?? []);
    setIsAuthenticated(true);
    setError("");
    return true;
  }, []);

  useEffect(() => {
    loadRecords()
      .catch(() => setError("No se pudo conectar con el servidor."))
      .finally(() => setIsCheckingSession(false));
  }, [loadRecords]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        setError(result.error ?? "No se pudo iniciar sesión.");
        return;
      }
      setPassword("");
      await loadRecords();
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/instruments/${id}`, {
        method: "PATCH",
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        setError(result.error ?? "No se pudo modificar el registro.");
        return;
      }
      setMessage(result.message ?? "Registro actualizado.");
      await loadRecords();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este registro y su foto? Esta acción no se puede deshacer.")) {
      return;
    }
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/instruments/${id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResult;
      if (!response.ok) {
        setError(result.error ?? "No se pudo eliminar el registro.");
        return;
      }
      setMessage(result.message ?? "Registro eliminado.");
      await loadRecords();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setBusyId("");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
      setRecords([]);
      setIsAuthenticated(false);
      setMessage("");
      setError("");
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  }

  if (isCheckingSession) {
    return <p className="intro">Verificando acceso...</p>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Link className="back-link" href="/">Volver al registro</Link>
        <header className="page-header">
          <div>
            <p className="eyebrow">ADMINISTRACIÓN</p>
            <h1>Acceso privado</h1>
            <p className="intro">Ingresa la contraseña de administración para ver los registros.</p>
          </div>
        </header>
        <form className="record-form" onSubmit={handleLogin}>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button className="primary-button" type="submit">Entrar</button>
          <p className="status-message" role={error ? "alert" : "status"} aria-live="polite">
            {error}
          </p>
        </form>
      </>
    );
  }

  return (
    <>
      <header className="page-header admin-header">
        <div>
          <p className="eyebrow">ADMINISTRACIÓN</p>
          <h1>Registros de instrumentos</h1>
          <p className="intro">{records.length} registro(s)</p>
        </div>
        <button className="secondary-button" type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <p className="status-message" role={error ? "alert" : "status"} aria-live="polite">
        {error || message}
      </p>

      {records.length === 0 ? (
        <p className="empty-state">Todavía no hay registros.</p>
      ) : (
        <div className="admin-record-list">
          {records.map((record) => (
            <form
              className="admin-record"
              key={record.id}
              onSubmit={(event) => handleSave(event, record.id)}
            >
              <div className="record-heading">
                <span>Creado {new Date(record.createdAt).toLocaleString("es")}</span>
                <a
                  href={`/api/admin/instruments/${record.id}/photo`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver foto
                </a>
              </div>
              <label>
                Nombre de la persona
                <input name="personName" type="text" maxLength={120} defaultValue={record.personName} required />
              </label>
              <label>
                Nombre del instrumento
                <input name="instrumentName" type="text" maxLength={160} defaultValue={record.instrumentName} required />
              </label>
              <div className="field-row">
                <label>
                  Número de parte
                  <input name="partNumber" type="text" maxLength={120} defaultValue={record.partNumber} required />
                </label>
                <label>
                  Número de serie
                  <input name="serialNumber" type="text" maxLength={120} defaultValue={record.serialNumber} required />
                </label>
              </div>
              <label>
                Reemplazar foto (opcional)
                <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
              </label>
              <div className="record-actions">
                <button className="primary-button" type="submit" disabled={busyId === record.id}>
                  {busyId === record.id ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  className="danger-button"
                  type="button"
                  disabled={busyId === record.id}
                  onClick={() => handleDelete(record.id)}
                >
                  Eliminar
                </button>
              </div>
            </form>
          ))}
        </div>
      )}
    </>
  );
}

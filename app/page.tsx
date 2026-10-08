import { InstrumentForm } from "@/app/components/InstrumentForm";

export default function Home() {
  return (
    <main className="page-shell">
      <section className="card">
        <header className="page-header">
          <div>
            <p className="eyebrow">INVENTARIO</p>
            <h1>Registrar instrumento</h1>
            <p className="intro">Completa los datos y adjunta una foto.</p>
          </div>
        </header>

        <InstrumentForm />
        <p className="privacy-note">
          Los datos se guardan en Neon. La foto se guarda de forma privada en Vercel Blob; en la
          base solo se conserva su URL.
        </p>
      </section>
    </main>
  );
}

import { auth, signIn, signOut } from "@/auth";
import { InstrumentForm } from "@/app/components/InstrumentForm";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="page-shell">
        <section className="card sign-in-card">
          <p className="eyebrow">INVENTARIO</p>
          <h1>Registro de instrumentos</h1>
          <p className="intro">Inicia sesión con una cuenta autorizada para registrar un instrumento.</p>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button className="primary-button" type="submit">
              Continuar con Google
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="card">
        <header className="page-header">
          <div>
            <p className="eyebrow">INVENTARIO</p>
            <h1>Registrar instrumento</h1>
            <p className="intro">
              Sesión iniciada como {session.user.email}. Completa los datos y adjunta una foto.
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="secondary-button" type="submit">
              Cerrar sesión
            </button>
          </form>
        </header>

        <InstrumentForm />
        <p className="privacy-note">
          Los datos se guardan en Neon. El archivo de imagen se guarda en Vercel Blob; en la base
          solo se conserva su URL.
        </p>
      </section>
    </main>
  );
}

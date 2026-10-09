import {
  adminSessionCookie,
  adminSessionDurationSeconds,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "La solicitud no es válida." }, { status: 400 });
  }

  const password =
    typeof body === "object" && body !== null && "password" in body
      ? body.password
      : undefined;
  if (typeof password !== "string" || password.length > 1024) {
    return Response.json({ error: "La contraseña no es válida." }, { status: 400 });
  }

  try {
    if (!verifyAdminPassword(password)) {
      return Response.json({ error: "La contraseña es incorrecta." }, { status: 401 });
    }
    const session = createAdminSession();
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return Response.json(
      { message: "Sesión iniciada." },
      {
        headers: {
          "Cache-Control": "no-store",
          "Set-Cookie": `${adminSessionCookie}=${session}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${adminSessionDurationSeconds}${secure}`,
        },
      },
    );
  } catch (error) {
    console.error("No se pudo iniciar la sesión de administración.", error);
    return Response.json(
      { error: "La autenticación no está configurada correctamente en el servidor." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return Response.json(
    { message: "Sesión cerrada." },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": `${adminSessionCookie}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`,
      },
    },
  );
}

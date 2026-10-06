import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const authSecret = process.env.AUTH_SECRET;
const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

if (!authSecret || !googleClientId || !googleClientSecret) {
  throw new Error(
    "Falta la configuración de Auth.js: define AUTH_SECRET, AUTH_GOOGLE_ID y AUTH_GOOGLE_SECRET.",
  );
}

const authorizedEmails = new Set(
  (process.env.AUTHORIZED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export function isAuthorizedEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  return authorizedEmails.has(email.trim().toLowerCase());
}

const { handlers, auth: nextAuthAuth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return isAuthorizedEmail(user.email);
    },
  },
});

export async function auth() {
  const session = await nextAuthAuth();
  if (!session?.user?.email || !isAuthorizedEmail(session.user.email)) {
    return null;
  }

  return session;
}

export { handlers, signIn, signOut };

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

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
  providers: [Google],
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

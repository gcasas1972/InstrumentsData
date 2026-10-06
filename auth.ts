import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const authorizedEmails = new Set(
  (process.env.AUTHORIZED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();
      return Boolean(email && authorizedEmails.has(email));
    },
  },
});

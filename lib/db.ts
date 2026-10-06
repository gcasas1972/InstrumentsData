import { neon } from "@neondatabase/serverless";

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta configurar DATABASE_URL.");
  }

  return neon(connectionString);
}

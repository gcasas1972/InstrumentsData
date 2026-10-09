import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const adminSessionCookie = "instrument_admin_session";
export const adminSessionDurationSeconds = 60 * 60 * 24 * 7;

function getAdminConfig() {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || password.length < 12) {
    throw new Error("Configura ADMIN_PASSWORD con al menos 12 caracteres.");
  }
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("Configura ADMIN_SESSION_SECRET con al menos 32 caracteres.");
  }

  return { password, sessionSecret };
}

function equalStrings(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function verifyAdminPassword(password: string) {
  const { password: configuredPassword } = getAdminConfig();
  return equalStrings(password, configuredPassword);
}

export function createAdminSession() {
  const { sessionSecret } = getAdminConfig();
  const expiresAt = Math.floor(Date.now() / 1000) + adminSessionDurationSeconds;
  const signature = createHmac("sha256", sessionSecret).update(String(expiresAt)).digest("hex");
  return `${expiresAt}.${signature}`;
}

export function isAdminRequest(request: Request) {
  const { sessionSecret } = getAdminConfig();
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${adminSessionCookie}=`));
  const session = sessionCookie?.slice(adminSessionCookie.length + 1);
  if (!session) return false;

  const [expiresAtValue, signature, ...extraParts] = session.split(".");
  const expiresAt = Number(expiresAtValue);
  const now = Math.floor(Date.now() / 1000);
  if (
    extraParts.length > 0 ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt > now + adminSessionDurationSeconds ||
    !signature ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const expected = createHmac("sha256", sessionSecret).update(expiresAtValue).digest("hex");
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
}

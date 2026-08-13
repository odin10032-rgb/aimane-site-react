import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "aa_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    // Dev fallback only — never relied on in production. We still warn.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET must be set to a long random string in production."
      );
    }
    return "insecure-dev-secret-please-change-me-xxxxxxxxx";
  }
  return secret;
}

function sign(payload: string): string {
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return sig;
}

export interface AdminSession {
  role: "admin";
  iat: number;
  exp: number;
}

/** Create a signed session value: base64(payload).signature */
function encode(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function decode(raw: string | undefined): AdminSession | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as AdminSession;
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function createAdminSession(): Promise<void> {
  const now = Date.now();
  const session: AdminSession = {
    role: "admin",
    iat: now,
    exp: now + SESSION_MAX_AGE * 1000,
  };
  const value = encode(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return decode(store.get(SESSION_COOKIE)?.value);
}

export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return !!session;
}

/** Throws a 401-shaped Response when not authenticated. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new UnauthorizedError();
  }
}

export class UnauthorizedError extends Error {
  status = 401 as const;
  constructor() {
    super("Unauthorized");
  }
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
  } catch {
    return false;
  }
}

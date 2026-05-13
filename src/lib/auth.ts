// JWT session helpers. Sessions live in httpOnly+SameSite=Strict cookies so JS
// never sees them and CSRF can't carry them across origins.

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";

const enc = new TextEncoder();
const SECRET = enc.encode(env.AUTH_SECRET);

export type SessionUser = {
  sub: string; // user id
  email: string;
  role: "user" | "admin";
  campus: string;
};

export async function signSession(payload: SessionUser): Promise<string> {
  return await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + env.SESSION_MAX_AGE)
    .setIssuer("campusfind")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: "campusfind" });
    if (!payload.sub || !payload.email) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: (payload.role as "user" | "admin") || "user",
      campus: String(payload.campus || ""),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(env.SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.IS_PROD,
    sameSite: "strict",
    path: "/",
    maxAge: env.SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(env.SESSION_COOKIE, "", {
    httpOnly: true,
    secure: env.IS_PROD,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const tok = store.get(env.SESSION_COOKIE)?.value;
  if (!tok) return null;
  return await verifySession(tok);
}

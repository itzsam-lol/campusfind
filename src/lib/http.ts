// Small helpers for API routes: consistent JSON, error wrapping, auth gates.
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession, type SessionUser } from "./auth";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(msg: string, details?: unknown) {
  return NextResponse.json({ error: msg, details }, { status: 400 });
}

export function unauthorized(msg = "Unauthorized") {
  return NextResponse.json({ error: msg }, { status: 401 });
}

export function forbidden(msg = "Forbidden") {
  return NextResponse.json({ error: msg }, { status: 403 });
}

export function notFound(msg = "Not found") {
  return NextResponse.json({ error: msg }, { status: 404 });
}

export function tooMany(msg = "Too many requests", retryAfterSec?: number) {
  return NextResponse.json(
    { error: msg, retryAfter: retryAfterSec },
    {
      status: 429,
      headers: retryAfterSec
        ? { "Retry-After": String(retryAfterSec) }
        : undefined,
    },
  );
}

export function serverError(err: unknown) {
  if (process.env.NODE_ENV !== "production") console.error("[api]", err);
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}

export async function requireSession(): Promise<
  | { ok: true; user: SessionUser }
  | { ok: false; res: NextResponse }
> {
  const user = await getCurrentSession();
  if (!user) return { ok: false, res: unauthorized() };
  return { ok: true, user };
}

export async function requireAdmin(): Promise<
  | { ok: true; user: SessionUser }
  | { ok: false; res: NextResponse }
> {
  const sess = await requireSession();
  if (!sess.ok) return sess;
  if (sess.user.role !== "admin")
    return { ok: false, res: forbidden("Admin only") };
  return sess;
}

export async function parseJson<S extends z.ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<
  | { ok: true; data: z.infer<S> }
  | { ok: false; res: NextResponse }
> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, res: badRequest("Invalid JSON body") };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      res: badRequest("Validation failed", result.error.flatten()),
    };
  }
  return { ok: true, data: result.data };
}

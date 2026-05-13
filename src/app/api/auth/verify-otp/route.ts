import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";
import { verifyOtpSchema } from "@/lib/validators";
import { env } from "@/lib/env";
import { signSession, setSessionCookie } from "@/lib/auth";
import { badRequest, json, parseJson, serverError, tooMany, unauthorized } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJson(req, verifyOtpSchema);
    if (!parsed.ok) return parsed.res;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    const limited = await rateLimit({
      scope: "otp:verify",
      identifier: parsed.data.email,
      max: 10,
      windowSeconds: 15 * 60,
    });
    if (!limited.allowed) return tooMany("Too many attempts", limited.retryAfter);
    if (ip) {
      const ipL = await rateLimit({
        scope: "otp:verify:ip",
        identifier: ip,
        max: 60,
        windowSeconds: 15 * 60,
      });
      if (!ipL.allowed) return tooMany("Too many attempts", ipL.retryAfter);
    }

    const result = await verifyOtp(parsed.data.email, parsed.data.code);
    if (!result.ok) {
      const reasonMessages = {
        not_found: "No active code — request a new one.",
        expired: "Code expired — request a new one.",
        exhausted: "Too many wrong attempts — request a new one.",
        invalid: "That code is incorrect.",
      } as const;
      return unauthorized(reasonMessages[result.reason]);
    }

    // Create-or-update user. Admin status is set if email is in ADMIN_EMAILS.
    const role = env.ADMIN_EMAILS.includes(parsed.data.email) ? "admin" : "user";

    const user = await prisma.user.upsert({
      where: { email: parsed.data.email },
      update: { campus: result.campus, lastLoginAt: new Date(), role },
      create: {
        email: parsed.data.email,
        campus: result.campus,
        role,
        lastLoginAt: new Date(),
      },
    });

    const token = await signSession({
      sub: user.id,
      email: user.email,
      role: user.role as "user" | "admin",
      campus: user.campus,
    });
    await setSessionCookie(token);

    return json({
      ok: true,
      user: { id: user.id, email: user.email, role: user.role, campus: user.campus, name: user.name },
    });
  } catch (e) {
    return serverError(e);
  }
}

import { NextRequest } from "next/server";
import { issueOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";
import { requestOtpSchema } from "@/lib/validators";
import { env } from "@/lib/env";
import { badRequest, json, parseJson, serverError, tooMany } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJson(req, requestOtpSchema);
    if (!parsed.ok) return parsed.res;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    // Two rate-limits: per email and per IP. Either trips, we refuse.
    const byEmail = await rateLimit({
      scope: "otp:request:email",
      identifier: parsed.data.email,
      max: 5,
      windowSeconds: 15 * 60,
    });
    if (!byEmail.allowed) return tooMany("Too many OTP requests", byEmail.retryAfter);

    if (ip) {
      const byIp = await rateLimit({
        scope: "otp:request:ip",
        identifier: ip,
        max: 20,
        windowSeconds: 15 * 60,
      });
      if (!byIp.allowed) return tooMany("Too many OTP requests", byIp.retryAfter);
    }

    const { code, expiresAt } = await issueOtp(parsed.data.email, parsed.data.campus, ip);

    return json({
      ok: true,
      message: "OTP issued. Check your email — or the server console in dev.",
      expiresAt: expiresAt.toISOString(),
      // Dev-only echo so the demo flow works without SMTP. Disabled in prod.
      devCode: env.OTP_DEV_ECHO ? code : undefined,
    });
  } catch (e) {
    return serverError(e);
  }
}

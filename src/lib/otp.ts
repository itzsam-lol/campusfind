// OTP generation, hashing, verification. Codes are bcrypt-hashed at rest so a
// DB leak doesn't reveal codes mid-window. Constant-time bcrypt comparison.

import bcrypt from "bcryptjs";
import { randomInt, createHash } from "node:crypto";
import { prisma } from "./prisma";
import { env } from "./env";

export function generateOtp(): string {
  // 6 digits, zero-padded.
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function issueOtp(
  email: string,
  campus: string,
  ip?: string | null,
): Promise<{ code: string; expiresAt: Date }> {
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.OTP_TTL_SECONDS * 1000);
  const ipHash = ip
    ? createHash("sha256").update(ip).digest("hex").slice(0, 32)
    : null;

  // Invalidate any other pending OTPs for this email so only the latest works.
  await prisma.otpToken.updateMany({
    where: { email, consumed: false },
    data: { consumed: true },
  });

  await prisma.otpToken.create({
    data: { email, campus, codeHash, expiresAt, ipHash },
  });

  // Log to server console — in dev the API will also echo to the client.
  console.log(`[OTP] ${email} → ${code} (expires in ${env.OTP_TTL_SECONDS}s)`);

  return { code, expiresAt };
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<
  | { ok: true; campus: string }
  | { ok: false; reason: "expired" | "invalid" | "exhausted" | "not_found" }
> {
  const tok = await prisma.otpToken.findFirst({
    where: { email, consumed: false },
    orderBy: { createdAt: "desc" },
  });
  if (!tok) return { ok: false, reason: "not_found" };

  if (tok.expiresAt < new Date()) {
    await prisma.otpToken.update({
      where: { id: tok.id },
      data: { consumed: true },
    });
    return { ok: false, reason: "expired" };
  }

  if (tok.attempts >= env.OTP_MAX_ATTEMPTS) {
    await prisma.otpToken.update({
      where: { id: tok.id },
      data: { consumed: true },
    });
    return { ok: false, reason: "exhausted" };
  }

  const match = await bcrypt.compare(code, tok.codeHash);
  if (!match) {
    await prisma.otpToken.update({
      where: { id: tok.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "invalid" };
  }

  // Burn the token.
  await prisma.otpToken.update({
    where: { id: tok.id },
    data: { consumed: true },
  });
  return { ok: true, campus: tok.campus };
}

// DB-backed sliding-window rate limiter. Simple and good enough for a single
// Node instance; swap for Redis if you scale horizontally.
import { prisma } from "./prisma";

type Outcome =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfter: number };

export async function rateLimit(opts: {
  scope: string;
  identifier: string;
  max: number;
  windowSeconds: number;
}): Promise<Outcome> {
  const { scope, identifier, max, windowSeconds } = opts;
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSeconds * 1000);

  // Try to find or create the bucket.
  const existing = await prisma.rateLimit.findUnique({
    where: { scope_identifier: { scope, identifier } },
  });

  if (!existing) {
    await prisma.rateLimit.create({
      data: { scope, identifier, count: 1, windowStart: now },
    });
    return { allowed: true, remaining: max - 1 };
  }

  if (existing.windowStart < cutoff) {
    // Window rolled over.
    await prisma.rateLimit.update({
      where: { id: existing.id },
      data: { count: 1, windowStart: now },
    });
    return { allowed: true, remaining: max - 1 };
  }

  if (existing.count >= max) {
    const retryAfter = Math.max(
      1,
      windowSeconds -
        Math.floor((now.getTime() - existing.windowStart.getTime()) / 1000),
    );
    return { allowed: false, retryAfter };
  }

  await prisma.rateLimit.update({
    where: { id: existing.id },
    data: { count: { increment: 1 } },
  });
  return { allowed: true, remaining: max - existing.count - 1 };
}

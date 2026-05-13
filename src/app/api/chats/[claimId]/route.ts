// GET and POST messages on a claim. Owner + claimant only.
// Admin can read for dispute resolution but can't impersonate either party.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  forbidden,
  json,
  notFound,
  parseJson,
  requireSession,
  serverError,
  tooMany,
} from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { messageSchema } from "@/lib/validators";
import { cleanText } from "@/lib/sanitize";

async function assertAccess(claimId: string, userId: string, role: string) {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: { listing: true },
  });
  if (!claim) return { ok: false as const, code: 404 };
  const isParty = claim.listing.ownerId === userId || claim.claimantId === userId;
  if (!isParty && role !== "admin") return { ok: false as const, code: 403 };
  return { ok: true as const, claim };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ claimId: string }> },
) {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const { claimId } = await params;
    const acc = await assertAccess(claimId, sess.user.sub, sess.user.role);
    if (!acc.ok) return acc.code === 404 ? notFound() : forbidden();

    const msgs = await prisma.message.findMany({
      where: { claimId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return json({
      messages: msgs.map((m) => ({
        id: m.id,
        kind: m.kind,
        body: m.body,
        fromMe: m.authorId === sess.user.sub,
        createdAt: m.createdAt.toISOString(),
      })),
      claim: {
        id: acc.claim.id,
        listingId: acc.claim.listingId,
        listingTitle: acc.claim.listing.title,
        status: acc.claim.status,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ claimId: string }> },
) {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const { claimId } = await params;
    const acc = await assertAccess(claimId, sess.user.sub, sess.user.role);
    if (!acc.ok) return acc.code === 404 ? notFound() : forbidden();
    if (sess.user.role === "admin" &&
        acc.claim.listing.ownerId !== sess.user.sub &&
        acc.claim.claimantId !== sess.user.sub) {
      return forbidden("Admins can read chats but not post into them");
    }
    if (acc.claim.status === "rejected")
      return forbidden("Chat closed for rejected claim");

    const limited = await rateLimit({
      scope: "chat:send",
      identifier: sess.user.sub,
      max: 60,
      windowSeconds: 60,
    });
    if (!limited.allowed) return tooMany("Slow down", limited.retryAfter);

    const parsed = await parseJson(req, messageSchema);
    if (!parsed.ok) return parsed.res;

    const msg = await prisma.message.create({
      data: {
        claimId,
        authorId: sess.user.sub,
        body: cleanText(parsed.data.body, 2000),
      },
    });

    return json({
      message: {
        id: msg.id,
        kind: msg.kind,
        body: msg.body,
        fromMe: true,
        createdAt: msg.createdAt.toISOString(),
      },
    });
  } catch (e) {
    return serverError(e);
  }
}

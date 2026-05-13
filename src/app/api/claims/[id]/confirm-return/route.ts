// Either party can mark a claim as "returned" — but we only flip once.
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  badRequest,
  forbidden,
  json,
  notFound,
  requireSession,
  serverError,
} from "@/lib/http";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;
    const { id } = await params;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!claim) return notFound("Claim not found");
    if (claim.status !== "approved") return badRequest("Claim isn't in handover state");
    const allowed = claim.claimantId === sess.user.sub || claim.listing.ownerId === sess.user.sub;
    if (!allowed && sess.user.role !== "admin") return forbidden();

    await prisma.$transaction([
      prisma.claim.update({
        where: { id },
        data: { status: "returned", returnedAt: new Date() },
      }),
      prisma.listing.update({
        where: { id: claim.listingId },
        data: { status: "returned" },
      }),
      prisma.message.create({
        data: {
          claimId: id,
          kind: "system",
          body: "Item handed over. Thanks for closing the loop!",
        },
      }),
    ]);

    return json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}

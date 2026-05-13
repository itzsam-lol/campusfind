import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  badRequest,
  forbidden,
  json,
  notFound,
  parseJson,
  requireSession,
  serverError,
  tooMany,
} from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createClaimSchema } from "@/lib/validators";
import { cleanText } from "@/lib/sanitize";

// Owner cannot claim their own listing. One pending claim per (listing, claimant).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const limited = await rateLimit({
      scope: "claim:create",
      identifier: sess.user.sub,
      max: 10,
      windowSeconds: 60 * 60,
    });
    if (!limited.allowed) return tooMany("Slow down", limited.retryAfter);

    const { id } = await params;
    const parsed = await parseJson(req, createClaimSchema);
    if (!parsed.ok) return parsed.res;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.status === "removed") return notFound("Listing not found");
    if (listing.ownerId === sess.user.sub) return forbidden("You posted this");
    if (listing.status !== "open") return badRequest("Listing not open");

    const existing = await prisma.claim.findUnique({
      where: { listingId_claimantId: { listingId: id, claimantId: sess.user.sub } },
    });
    if (existing) return badRequest("You already have a claim on this listing");

    const claim = await prisma.claim.create({
      data: {
        listingId: id,
        claimantId: sess.user.sub,
        description: cleanText(parsed.data.description, 2000),
      },
    });

    // Notify the listing owner.
    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        kind: "claim_received",
        title: "New claim on your listing",
        body: `Someone is claiming "${listing.title}"`,
        data: JSON.stringify({ claimId: claim.id, listingId: listing.id }),
      },
    });

    return json({ claim: { id: claim.id, status: claim.status } }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}

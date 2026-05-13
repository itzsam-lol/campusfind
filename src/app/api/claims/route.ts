// List claims relevant to the current user: ones they made, plus ones on
// listings they posted.
import { prisma } from "@/lib/prisma";
import { json, requireSession, serverError } from "@/lib/http";

export async function GET() {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const made = await prisma.claim.findMany({
      where: { claimantId: sess.user.sub },
      include: { listing: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const onMine = await prisma.claim.findMany({
      where: { listing: { ownerId: sess.user.sub } },
      include: { listing: true, claimant: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return json({
      made: made.map((c) => ({
        id: c.id,
        listingId: c.listingId,
        listingTitle: c.listing.title,
        listingLocation: c.listing.locationName,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        decidedAt: c.decidedAt?.toISOString() ?? null,
        returnedAt: c.returnedAt?.toISOString() ?? null,
      })),
      received: onMine.map((c) => ({
        id: c.id,
        listingId: c.listingId,
        listingTitle: c.listing.title,
        description: c.description,
        // Claimant identity is hidden while pending — owner sees a display name
        // only after they approve the claim.
        claimantHint:
          c.status === "pending"
            ? "Anonymous"
            : c.claimant?.name || c.claimant?.email.split("@")[0] || "Student",
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}

// Approve / reject a claim. Only the listing owner (or admin) can decide.
// On approval the listing flips to "claimed" and other open claims auto-reject.
// Approver creates a system message in the chat.

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
} from "@/lib/http";
import { decideClaimSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const { id } = await params;
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        listing: true,
        claimant: { select: { id: true, name: true, email: true } },
      },
    });
    if (!claim) return notFound("Claim not found");

    const isOwner = claim.listing.ownerId === sess.user.sub;
    const isClaimant = claim.claimantId === sess.user.sub;
    if (!isOwner && !isClaimant && sess.user.role !== "admin")
      return forbidden("Not your claim");

    const exposeClaimant =
      isOwner && (claim.status === "approved" || claim.status === "returned");

    return json({
      claim: {
        id: claim.id,
        listingId: claim.listingId,
        listingTitle: claim.listing.title,
        description: isOwner ? claim.description : undefined,
        status: claim.status,
        createdAt: claim.createdAt.toISOString(),
        decidedAt: claim.decidedAt?.toISOString() ?? null,
        returnedAt: claim.returnedAt?.toISOString() ?? null,
        finderHint: isClaimant
          ? claim.status === "approved" || claim.status === "returned"
            ? "Revealed after approval"
            : "Anonymous"
          : undefined,
        claimant: exposeClaimant && claim.claimant
          ? { id: claim.claimant.id, name: claim.claimant.name, email: claim.claimant.email }
          : undefined,
        role: isOwner ? "owner" : isClaimant ? "claimant" : "admin",
      },
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const { id } = await params;
    const parsed = await parseJson(req, decideClaimSchema);
    if (!parsed.ok) return parsed.res;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!claim) return notFound("Claim not found");

    const isOwner = claim.listing.ownerId === sess.user.sub;
    if (!isOwner && sess.user.role !== "admin") return forbidden("Owner only");
    if (claim.status !== "pending") return badRequest("Already decided");

    const newStatus = parsed.data.decision === "approve" ? "approved" : "rejected";

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.claim.update({
        where: { id },
        data: { status: newStatus, decidedAt: new Date() },
      });

      if (newStatus === "approved") {
        // Flip listing → claimed, auto-reject other open claims.
        await tx.listing.update({
          where: { id: claim.listingId },
          data: { status: "claimed" },
        });
        await tx.claim.updateMany({
          where: { listingId: claim.listingId, status: "pending", id: { not: claim.id } },
          data: { status: "rejected", decidedAt: new Date() },
        });
        await tx.message.create({
          data: {
            claimId: claim.id,
            kind: "system",
            body: "Claim approved! Coordinate your handover.",
          },
        });
        await tx.notification.create({
          data: {
            userId: claim.claimantId,
            kind: "claim_approved",
            title: "Your claim was approved",
            body: `${claim.listing.title} — coordinate handover in chat`,
            data: JSON.stringify({ claimId: claim.id, listingId: claim.listingId }),
          },
        });
      } else {
        await tx.notification.create({
          data: {
            userId: claim.claimantId,
            kind: "claim_rejected",
            title: "Claim update",
            body: `Your claim on "${claim.listing.title}" wasn't approved.`,
            data: JSON.stringify({ claimId: claim.id }),
          },
        });
      }

      return u;
    });

    return json({ claim: { id: updated.id, status: updated.status } });
  } catch (e) {
    return serverError(e);
  }
}

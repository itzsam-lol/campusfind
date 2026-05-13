import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { listingPublic } from "@/lib/sanitize";
import ClaimClient from "./ClaimClient";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const sess = await getCurrentSession();
  if (!sess) redirect("/login");
  const { listingId } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { photos: { take: 1 } },
  });
  if (!listing || listing.status === "removed") notFound();
  if (listing.ownerId === sess.sub) redirect(`/listings/${listingId}`);

  // If they already have a claim, take them to the chat or back to listing.
  const existing = await prisma.claim.findFirst({
    where: { listingId, claimantId: sess.sub },
    select: { id: true, status: true },
  });
  if (existing) redirect(`/chat/${existing.id}`);

  return <ClaimClient listing={listingPublic(listing)} />;
}

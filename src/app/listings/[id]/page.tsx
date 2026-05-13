import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { listingPublic } from "@/lib/sanitize";
import ListingClient from "./ListingClient";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sess = await getCurrentSession();
  if (!sess) redirect("/login");
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!listing || listing.status === "removed") notFound();

  const isOwner = listing.ownerId === sess.sub;
  const myClaim = await prisma.claim.findFirst({
    where: { listingId: id, claimantId: sess.sub },
    select: { id: true, status: true },
  });

  return (
    <ListingClient
      listing={listingPublic(listing)}
      isOwner={isOwner}
      myClaim={myClaim ? { id: myClaim.id, status: myClaim.status } : null}
    />
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import ActivityClient from "./ActivityClient";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const sess = await getCurrentSession();
  if (!sess) redirect("/login?next=/activity");

  const [myListings, claimsMade, claimsReceived] = await Promise.all([
    prisma.listing.findMany({
      where: { ownerId: sess.sub, status: { not: "removed" } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.claim.findMany({
      where: { claimantId: sess.sub },
      include: { listing: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.claim.findMany({
      where: { listing: { ownerId: sess.sub } },
      include: { listing: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <ActivityClient
      myLost={myListings.filter((l) => l.kind === "lost").map((l) => ({
        id: l.id,
        name: l.title,
        loc: l.locationName,
        when: l.createdAt.toISOString(),
        status: l.status,
      }))}
      myFound={myListings.filter((l) => l.kind === "found").map((l) => ({
        id: l.id,
        name: l.title,
        loc: l.locationName,
        when: l.createdAt.toISOString(),
        status: l.status,
      }))}
      claims={claimsMade.map((c) => ({
        id: c.id,
        listingId: c.listingId,
        name: c.listing.title,
        loc: c.listing.locationName,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      }))}
      received={claimsReceived.map((c) => ({
        id: c.id,
        listingId: c.listingId,
        name: c.listing.title,
        loc: c.listing.locationName,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}

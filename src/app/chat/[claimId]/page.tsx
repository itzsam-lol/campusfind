import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  const sess = await getCurrentSession();
  if (!sess) redirect("/login");
  const { claimId } = await params;
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: { listing: true },
  });
  if (!claim) notFound();
  const isParty =
    claim.listing.ownerId === sess.sub || claim.claimantId === sess.sub;
  if (!isParty && sess.role !== "admin") notFound();
  return <ChatClient claimId={claim.id} initialStatus={claim.status} listingTitle={claim.listing.title} role={claim.listing.ownerId === sess.sub ? "owner" : claim.claimantId === sess.sub ? "claimant" : "admin"} />;
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import MeClient from "./MeClient";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const sess = await getCurrentSession();
  if (!sess) redirect("/login?next=/me");
  const user = await prisma.user.findUnique({
    where: { id: sess.sub },
    select: { id: true, email: true, name: true, role: true, campus: true, createdAt: true },
  });
  if (!user) redirect("/login");
  const [posted, claimed, returned] = await Promise.all([
    prisma.listing.count({ where: { ownerId: user.id } }),
    prisma.claim.count({ where: { claimantId: user.id } }),
    prisma.listing.count({ where: { ownerId: user.id, status: "returned" } }),
  ]);
  return <MeClient user={user} stats={{ posted, claimed, returned }} />;
}

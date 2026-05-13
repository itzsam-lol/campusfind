import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const sess = await getCurrentSession();
  if (!sess) redirect("/login?next=/notifications");
  const items = await prisma.notification.findMany({
    where: { userId: sess.sub },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <NotificationsClient
      initial={items.map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        read: !!n.readAt,
        createdAt: n.createdAt.toISOString(),
      }))}
    />
  );
}

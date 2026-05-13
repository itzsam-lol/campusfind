import { prisma } from "@/lib/prisma";
import { json, requireSession, serverError } from "@/lib/http";

export async function GET() {
  try {
    const sess = await requireSession();
    if (!sess.ok) return sess.res;

    const list = await prisma.notification.findMany({
      where: { userId: sess.user.sub },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return json({
      items: list.map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        read: !!n.readAt,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST() {
  // Mark all as read.
  const sess = await requireSession();
  if (!sess.ok) return sess.res;
  await prisma.notification.updateMany({
    where: { userId: sess.user.sub, readAt: null },
    data: { readAt: new Date() },
  });
  return json({ ok: true });
}

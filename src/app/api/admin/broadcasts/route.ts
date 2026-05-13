import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  json,
  parseJson,
  requireAdmin,
  serverError,
} from "@/lib/http";
import { broadcastSchema } from "@/lib/validators";
import { cleanText } from "@/lib/sanitize";

export async function GET() {
  try {
    const adm = await requireAdmin();
    if (!adm.ok) return adm.res;

    const items = await prisma.broadcast.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return json({
      items: items.map((b) => ({
        id: b.id,
        title: b.title,
        body: b.body,
        audience: b.audience,
        scheduledAt: b.scheduledAt?.toISOString() ?? null,
        sentAt: b.sentAt?.toISOString() ?? null,
        createdAt: b.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adm = await requireAdmin();
    if (!adm.ok) return adm.res;
    const parsed = await parseJson(req, broadcastSchema);
    if (!parsed.ok) return parsed.res;

    const now = new Date();
    const scheduled = parsed.data.scheduledAt && parsed.data.scheduledAt > now;

    const b = await prisma.broadcast.create({
      data: {
        authorId: adm.user.sub,
        campus: adm.user.campus,
        audience: parsed.data.audience,
        title: cleanText(parsed.data.title, 120),
        body: cleanText(parsed.data.body, 2000),
        scheduledAt: parsed.data.scheduledAt ?? null,
        sentAt: scheduled ? null : now,
      },
    });

    if (!scheduled) {
      // Fan out as notifications to users on this campus.
      const recipients = await prisma.user.findMany({
        where: { campus: adm.user.campus },
        select: { id: true },
      });
      if (recipients.length) {
        await prisma.notification.createMany({
          data: recipients.map((r) => ({
            userId: r.id,
            kind: "broadcast",
            title: b.title,
            body: b.body,
          })),
        });
      }
    }

    return json({ broadcast: { id: b.id, sentAt: b.sentAt, scheduledAt: b.scheduledAt } }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  badRequest,
  json,
  notFound,
  parseJson,
  requireAdmin,
  serverError,
} from "@/lib/http";

const actionSchema = z.object({
  action: z.enum(["approve", "remove", "flag", "unflag"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adm = await requireAdmin();
    if (!adm.ok) return adm.res;
    const { id } = await params;
    const parsed = await parseJson(req, actionSchema);
    if (!parsed.ok) return parsed.res;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return notFound();

    let data: Record<string, unknown> = {};
    switch (parsed.data.action) {
      case "approve":
        data = { flagged: false, status: listing.status === "flagged" ? "open" : listing.status };
        break;
      case "remove":
        data = { status: "removed" };
        break;
      case "flag":
        data = { flagged: true };
        break;
      case "unflag":
        data = { flagged: false };
        break;
    }
    const updated = await prisma.listing.update({ where: { id }, data });
    return json({ ok: true, status: updated.status, flagged: updated.flagged });
  } catch (e) {
    return serverError(e);
  }
}

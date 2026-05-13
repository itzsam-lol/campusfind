import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { json, unauthorized } from "@/lib/http";

export async function GET() {
  const sess = await getCurrentSession();
  if (!sess) return unauthorized();
  const user = await prisma.user.findUnique({
    where: { id: sess.sub },
    select: { id: true, email: true, name: true, role: true, campus: true, createdAt: true },
  });
  if (!user) return unauthorized();
  return json({ user });
}

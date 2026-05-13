import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
  const claims = await prisma.claim.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      listing: { select: { id: true, title: true } },
      claimant: { select: { email: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Claims</h1>
        <div className="text-sm text-cf-slate mt-1">{claims.length} total</div>
      </div>

      <section className="bg-white rounded-xl border border-[rgba(70,75,85,0.10)] shadow-cf overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#F7F4EF" }}>
                {["Listing", "Claimant", "Status", "Created", "Decided"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-cf-slate border-b border-[rgba(70,75,85,0.10)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.map((c, i) => (
                <tr key={c.id} className={i < claims.length - 1 ? "border-b border-[rgba(70,75,85,0.10)]" : ""}>
                  <td className="px-4 py-3">
                    <Link href={`/listings/${c.listingId}`} className="font-medium hover:underline">
                      {c.listing.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-cf-text2">{c.claimant.email}</td>
                  <td className="px-4 py-3 capitalize">{c.status}</td>
                  <td className="px-4 py-3 text-cf-slate text-[12px]">
                    {c.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-cf-slate text-[12px]">
                    {c.decidedAt ? c.decidedAt.toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {claims.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-cf-slate">No claims.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

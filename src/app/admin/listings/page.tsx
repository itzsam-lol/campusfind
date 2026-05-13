"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Icon } from "@/components/icons";

type Row = {
  id: string;
  title: string;
  category: string;
  campus: string;
  status: string;
  flagged: boolean;
  ownerEmail: string;
  createdAt: string;
};

export default function AdminListingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  async function refresh() {
    const data = await api<{ items: Row[] }>("/api/admin/listings?limit=50");
    setRows(data.items);
  }
  useEffect(() => {
    void refresh();
  }, []);

  const visible = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "flagged") return r.flagged;
    return r.status === filter;
  });

  async function act(id: string, action: "approve" | "remove" | "flag" | "unflag") {
    setBusy(id);
    try {
      await api(`/api/admin/listings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Listings</h1>
          <div className="text-sm text-cf-slate mt-1">{rows.length} total</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "open", "claimed", "returned", "removed", "flagged"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="h-8 px-3 rounded-md text-xs font-medium capitalize"
              style={{
                background: filter === f ? "#D6E8F7" : "#fff",
                color: filter === f ? "#2C4A5E" : "#566472",
                border: `0.5px solid ${filter === f ? "#A8C4D9" : "rgba(70,75,85,0.18)"}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-white rounded-xl border border-[rgba(70,75,85,0.10)] shadow-cf overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#F7F4EF" }}>
                {["Item", "Category", "Campus", "Posted by", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-cf-slate border-b border-[rgba(70,75,85,0.10)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-cf-slate">No listings match.</td>
                </tr>
              )}
              {visible.map((l, i) => (
                <tr key={l.id} className={i < visible.length - 1 ? "border-b border-[rgba(70,75,85,0.10)]" : ""}>
                  <td className="px-4 py-3">
                    <Link href={`/listings/${l.id}`} className="font-medium hover:underline">
                      {l.title}
                    </Link>
                    {l.flagged && (
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "#F5C0C0", color: "#8A3A3A" }}>
                        FLAGGED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cf-text2 capitalize">{l.category}</td>
                  <td className="px-4 py-3 text-cf-text2">{l.campus}</td>
                  <td className="px-4 py-3 text-cf-text2 text-[12px]">{l.ownerEmail}</td>
                  <td className="px-4 py-3 capitalize">{l.status}</td>
                  <td className="px-4 py-3 text-cf-slate text-[12px]">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-[12px] font-semibold">
                      <button onClick={() => act(l.id, "approve")} disabled={busy === l.id} className="text-cf-sageDark">Approve</button>
                      <button onClick={() => act(l.id, l.flagged ? "unflag" : "flag")} disabled={busy === l.id} className="text-cf-amberDark">
                        {l.flagged ? "Unflag" : "Flag"}
                      </button>
                      <button onClick={() => act(l.id, "remove")} disabled={busy === l.id} className="text-cf-redDark">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

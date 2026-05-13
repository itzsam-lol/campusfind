"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Icon } from "@/components/icons";

type Row = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  campus: string;
  createdAt: string;
  lastLoginAt: string | null;
  listingsCount: number;
  claimsCount: number;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      const data = await api<{ items: Row[] }>(`/api/admin/users${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
      setRows(data.items);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Users</h1>
          <div className="text-sm text-cf-slate mt-1">{rows.length} shown</div>
        </div>
        <div className="flex items-center bg-white rounded-lg border border-[rgba(70,75,85,0.18)] px-3 h-9 w-72 max-w-full">
          <Icon.search size={14} stroke="#8A9AA8" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
            className="ml-2 flex-1 outline-0 bg-transparent text-sm"
          />
        </div>
      </div>

      <section className="bg-white rounded-xl border border-[rgba(70,75,85,0.10)] shadow-cf overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#F7F4EF" }}>
                {["Email", "Name", "Campus", "Role", "Listings", "Claims", "Joined", "Last login"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-cf-slate border-b border-[rgba(70,75,85,0.10)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-cf-slate">No matches.</td>
                </tr>
              )}
              {rows.map((u, i) => (
                <tr key={u.id} className={i < rows.length - 1 ? "border-b border-[rgba(70,75,85,0.10)]" : ""}>
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-cf-text2">{u.name || "—"}</td>
                  <td className="px-4 py-3">{u.campus}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.listingsCount}</td>
                  <td className="px-4 py-3">{u.claimsCount}</td>
                  <td className="px-4 py-3 text-cf-slate text-[12px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-cf-slate text-[12px]">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}
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

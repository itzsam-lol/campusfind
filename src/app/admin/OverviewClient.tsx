"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Icon } from "@/components/icons";

type Stats = {
  metrics: {
    openListings: number;
    activeClaims: number;
    returnedThisWeek: number;
    returnedDelta: number;
    newUsers: number;
    newUsersDelta: number;
  };
  timeseries: { day: string; value: number }[];
  categories: { label: string; value: number; count: number }[];
  locations: { label: string; value: number }[];
};

type Listing = {
  id: string;
  title: string;
  category: string;
  campus: string;
  status: string;
  flagged: boolean;
  ownerEmail: string;
  createdAt: string;
};

const PALETTE = ["#A8C4D9", "#C8DDD1", "#E8D2A6", "#D7BABA", "#C8BCD2", "#DCD0B7"];

export default function OverviewClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    const [s, l] = await Promise.all([
      api<Stats>("/api/admin/stats"),
      api<{ items: Listing[] }>("/api/admin/listings?limit=10"),
    ]);
    setStats(s);
    setListings(l.items);
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function act(id: string, action: "approve" | "remove" | "flag" | "unflag") {
    setBusy(id + action);
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
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Overview</h1>
          <div className="text-sm text-cf-slate mt-1">
            Activity across the campus · this week
          </div>
        </div>
        <div className="flex gap-2.5">
          <button className="h-9 px-3.5 rounded-lg bg-white border border-[rgba(70,75,85,0.18)] text-[13px] font-medium text-cf-slateDk inline-flex items-center gap-1.5">
            <Icon.calendar size={14} stroke="#8A9AA8" /> This week
          </button>
          <Link
            href="/admin/broadcasts"
            className="h-9 px-3.5 rounded-lg text-[13px] font-semibold inline-flex items-center gap-1.5"
            style={{ background: "#A8C4D9", color: "#2A3340" }}
          >
            <Icon.megaphone size={14} stroke="#2A3340" /> New Broadcast
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Open Listings" value={stats?.metrics.openListings ?? 0} delta="+0 today" tone="blue" />
        <Metric label="Active Claims" value={stats?.metrics.activeClaims ?? 0} delta="pending" tone="blue" />
        <Metric label="Returned This Week" value={stats?.metrics.returnedThisWeek ?? 0} delta={`${stats?.metrics.returnedDelta ?? 0}% vs last`} tone="sage" />
        <Metric label="New Users This Week" value={stats?.metrics.newUsers ?? 0} delta={`${stats?.metrics.newUsersDelta ?? 0}% vs last`} tone="sage" />
      </div>

      {/* Recent listings */}
      <section className="bg-white rounded-xl border border-[rgba(70,75,85,0.10)] shadow-cf overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[rgba(70,75,85,0.10)]">
          <div className="text-sm font-semibold">Recent Listings</div>
          <Link href="/admin/listings" className="text-xs text-cf-blueDark font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "#F7F4EF" }}>
                {["Item", "Category", "Status", "Posted by", "Posted", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-cf-slate border-b border-[rgba(70,75,85,0.10)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-cf-slate">
                    No listings yet.
                  </td>
                </tr>
              )}
              {listings.map((l, i) => (
                <tr key={l.id} className={i < listings.length - 1 ? "border-b border-[rgba(70,75,85,0.10)]" : ""}>
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
                  <td className="px-4 py-3 capitalize">{l.status}</td>
                  <td className="px-4 py-3 text-cf-text2 text-[12px]">{l.ownerEmail}</td>
                  <td className="px-4 py-3 text-cf-slate text-[12px]">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-[12px] font-semibold">
                      <button onClick={() => act(l.id, "approve")} disabled={!!busy} className="text-cf-sageDark">
                        Approve
                      </button>
                      <button onClick={() => act(l.id, l.flagged ? "unflag" : "flag")} disabled={!!busy} className="text-cf-amberDark">
                        {l.flagged ? "Unflag" : "Flag"}
                      </button>
                      <button onClick={() => act(l.id, "remove")} disabled={!!busy} className="text-cf-redDark">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Listings over time" sub="Last 14 days" wide>
          <LineChart data={stats?.timeseries || []} />
        </Panel>
        <Panel title="Category breakdown" sub="All campuses">
          <Donut data={stats?.categories || []} />
        </Panel>
        <Panel title="Return rate by location" sub="Top 5">
          <BarChart data={stats?.locations || []} />
        </Panel>
      </section>
    </div>
  );
}

function Metric({ label, value, delta, tone }: { label: string; value: number; delta?: string; tone: "sage" | "blue" }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-[rgba(70,75,85,0.10)] shadow-cf">
      <div className="text-xs font-medium text-cf-slate">{label}</div>
      <div className="flex items-baseline gap-2.5 mt-2">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {delta && (
          <span
            className="inline-flex items-center h-[22px] px-2 rounded-md text-[11px] font-semibold"
            style={{
              background: tone === "sage" ? "#C8DDD1" : "#D6E8F7",
              color: tone === "sage" ? "#3A6452" : "#3F5A6B",
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function Panel({
  title,
  sub,
  wide = false,
  children,
}: {
  title: string;
  sub: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-xl border border-[rgba(70,75,85,0.10)] shadow-cf p-4 ${wide ? "lg:col-span-1" : ""}`}>
      <div className="text-[13px] font-semibold">{title}</div>
      <div className="text-[11px] text-cf-slate mt-0.5 mb-3.5">{sub}</div>
      {children}
    </div>
  );
}

function LineChart({ data }: { data: { day: string; value: number }[] }) {
  const W = 340, H = 140, P = 20;
  if (data.length === 0) return <div className="h-[140px] flex items-center justify-center text-cf-slate text-xs">No data</div>;
  const max = Math.max(2, ...data.map((d) => d.value));
  const x = (i: number) => P + (i * (W - P * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => H - P - (v / max) * (H - P * 2);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const area = path + ` L${x(data.length - 1)},${H - P} L${x(0)},${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block">
      {[0, max / 2, max].map((g, i) => (
        <line key={i} x1={P} x2={W - P} y1={y(g)} y2={y(g)} stroke="rgba(70,75,85,0.10)" />
      ))}
      <path d={area} fill="#D6E8F7" opacity="0.7" />
      <path d={path} stroke="#A8C4D9" strokeWidth="2" fill="none" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].value)} r="3.5" fill="#3F5A6B" />
    </svg>
  );
}

function Donut({ data }: { data: { label: string; value: number; count: number }[] }) {
  const C = 2 * Math.PI * 36;
  let off = 0;
  const total = data.reduce((a, d) => a + d.count, 0);
  if (data.length === 0) return <div className="h-[120px] flex items-center justify-center text-cf-slate text-xs">No data</div>;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" width="110" height="110">
        <circle cx="50" cy="50" r="36" fill="none" stroke="#F0EDE8" strokeWidth="14" />
        {data.map((d, i) => {
          const len = (d.value / 100) * C;
          const r = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="36"
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="14"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-off}
              transform="rotate(-90 50 50)"
            />
          );
          off += len;
          return r;
        })}
        <text x="50" y="48" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2A3340">{total}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="7" fill="#8A9AA8">items</text>
      </svg>
      <div className="flex flex-col gap-1.5 text-[11px] text-cf-slateDk">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="capitalize">{d.label}</span>
            <span className="text-cf-slate ml-1">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return <div className="h-[120px] flex items-center justify-center text-cf-slate text-xs">No data</div>;
  return (
    <div className="flex flex-col gap-2.5 pt-1">
      {data.map((d) => (
        <div key={d.label}>
          <div className="flex justify-between text-[11px] text-cf-slateDk mb-1">
            <span>{d.label}</span>
            <span className="text-cf-slate">{Math.round(d.value * 100)}%</span>
          </div>
          <div className="h-2 rounded bg-cf-card overflow-hidden">
            <div className="h-full" style={{ width: `${Math.max(2, d.value * 100)}%`, background: "linear-gradient(90deg, #A8C4D9 0%, #C8DDD1 100%)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

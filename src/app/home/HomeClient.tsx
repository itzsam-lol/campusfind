"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { CategoryBadge, EmptyState, Input, PhotoThumb, StatusPill } from "@/components/ui";
import { BottomNav } from "@/components/bottom-nav";
import { HeaderBar } from "@/components/header-bar";
import { api } from "@/lib/api-client";

type Listing = {
  id: string;
  title: string;
  category: string;
  campus: string;
  locationName: string;
  status: string;
  createdAt: string;
  kind: string;
  photos: { id: string; data: string; tone: string | null }[];
};

const CATS = ["All", "Electronics", "Documents", "Keys", "Clothing", "Accessories"];

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  const diffMin = Math.floor((Date.now() - d) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days`;
  return new Date(iso).toLocaleDateString();
}

export default function HomeClient({
  initial,
  campus,
  kind: initialKind,
  category: initialCat,
}: {
  initial: Listing[];
  campus: string;
  kind: "found" | "lost";
  category: string;
}) {
  const [tab, setTab] = useState<"found" | "lost">(initialKind);
  const [chip, setChip] = useState(initialCat);
  const [items, setItems] = useState<Listing[]>(initial);
  const [q, setQ] = useState("");
  const [fab, setFab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ kind: tab, campus });
        if (chip !== "All") params.set("category", chip.toLowerCase());
        if (q.trim()) params.set("q", q.trim());
        const data = await api<{ items: Listing[] }>(`/api/listings?${params.toString()}`);
        setItems(data.items);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab, chip, campus, q]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ items: { read: boolean }[] }>("/api/notifications");
        setUnread(data.items.filter((n) => !n.read).length);
      } catch {}
    })();
  }, []);

  const visible = useMemo(() => items, [items]);

  return (
    <main className="cf-shell min-h-dvh flex flex-col" style={{ paddingBottom: 96 }}>
      <HeaderBar
        left={
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight">CampusFind</span>
            <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold" style={{ background: "#D6E8F7", color: "#2C4A5E" }}>{campus}</span>
          </div>
        }
        right={
          <Link href="/notifications" className="relative w-8 h-8 flex items-center justify-center">
            <Icon.bell size={20} stroke="#566472" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full" style={{ background: "#D97A6C", border: "1.5px solid #fff" }} />
            )}
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-6 px-4 pt-3 bg-white border-b border-[rgba(70,75,85,0.10)]">
        {(["found", "lost"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="pt-1 pb-2.5 -mb-px text-sm"
            style={{
              fontWeight: tab === t ? 600 : 500,
              color: tab === t ? "#3F5A6B" : "#8A9AA8",
              borderBottom: `2px solid ${tab === t ? "#A8C4D9" : "transparent"}`,
            }}
          >
            {t === "found" ? "Found" : "Lost"}
          </button>
        ))}
      </div>

      {/* Chips */}
      <div className="flex gap-2 px-4 py-3 bg-white overflow-x-auto no-scrollbar">
        {CATS.map((c) => {
          const active = chip === c;
          return (
            <button
              key={c}
              onClick={() => setChip(c)}
              className="h-[30px] px-3 rounded-full whitespace-nowrap text-xs font-medium"
              style={{
                background: active ? "#D6E8F7" : "#F0EDE8",
                color: active ? "#2C4A5E" : "#566472",
                border: `0.5px solid ${active ? "#A8C4D9" : "rgba(70,75,85,0.18)"}`,
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-cf-bg border-b border-[rgba(70,75,85,0.10)]">
        <Input
          leadingIcon={<Icon.search size={16} stroke="#8A9AA8" />}
          placeholder="Search lost & found items..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-10"
        />
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 py-3">
        {loading && items.length === 0 ? (
          <EmptyState title="Loading…" />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No items yet"
            body={tab === "found" ? "Be the first to post something you've found." : "No one's reported losing this kind of item yet."}
            icon={<Icon.search size={24} stroke="#8A9AA8" />}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((it) => (
              <Link
                key={it.id}
                href={`/listings/${it.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-cf border border-[rgba(70,75,85,0.10)]"
              >
                <div className="relative">
                  <PhotoThumb
                    data={it.photos[0]?.data}
                    category={it.category}
                    tone={it.photos[0]?.tone || undefined}
                  />
                  <CategoryBadge className="absolute top-2 left-2 capitalize">{it.category}</CategoryBadge>
                </div>
                <div className="p-2.5">
                  <div className="text-[13px] font-semibold text-cf-text leading-tight mb-1 line-clamp-2">{it.title}</div>
                  <div className="flex items-center gap-1 mb-2">
                    <Icon.pin size={11} stroke="#8A9AA8" />
                    <span className="text-[11px] text-cf-slate truncate">{it.locationName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cf-slate">{relTime(it.createdAt)}</span>
                    <StatusPill kind={it.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setFab(true)}
        className="fixed bottom-[78px] right-5 md:right-[calc((100vw-420px)/2+20px)] w-14 h-14 rounded-full shadow-fab z-40"
        style={{ background: "#A8C4D9" }}
        aria-label="Post"
      >
        <Icon.plus size={26} stroke="#2A3340" />
      </button>

      {fab && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setFab(false)} />
          <div className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl p-5 pb-8 md:max-w-[420px] md:left-1/2 md:-translate-x-1/2 shadow-cf2">
            <div className="w-9 h-1 rounded bg-[rgba(70,75,85,0.18)] mx-auto mb-4" />
            <div className="text-[17px] font-semibold mb-3">Post a new listing</div>
            <Link
              href="/post?kind=found"
              onClick={() => setFab(false)}
              className="w-full flex items-center gap-3 p-3.5 mb-2.5 rounded-xl"
              style={{ background: "#D6E8F7" }}
            >
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <Icon.search size={20} stroke="#566472" />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-cf-text">I Found Something</div>
                <div className="text-[11px] text-cf-text2 mt-0.5">Help return it to its owner</div>
              </div>
              <Icon.chev size={16} stroke="#8A9AA8" />
            </Link>
            <Link
              href="/post?kind=lost"
              onClick={() => setFab(false)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background: "#F2E5C6" }}
            >
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <Icon.alert size={20} stroke="#566472" />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-cf-text">I Lost Something</div>
                <div className="text-[11px] text-cf-text2 mt-0.5">Let the campus help you find it</div>
              </div>
              <Icon.chev size={16} stroke="#8A9AA8" />
            </Link>
          </div>
        </>
      )}

      <BottomNav />
    </main>
  );
}

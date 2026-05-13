"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, EmptyState, ItemThumb, StatusPill } from "@/components/ui";
import { HeaderBar } from "@/components/header-bar";
import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/icons";

type Item = { id: string; name: string; loc: string; when: string; status: string; listingId?: string };
type Claim = { id: string; listingId: string; name: string; loc: string; status: string; createdAt: string };

export default function ActivityClient({
  myLost,
  myFound,
  claims,
  received,
}: {
  myLost: Item[];
  myFound: Item[];
  claims: Claim[];
  received: Claim[];
}) {
  const [tab, setTab] = useState<"lost" | "found" | "claims" | "received">("claims");

  const tabs: { k: typeof tab; label: string; count: number }[] = [
    { k: "claims", label: "My Claims", count: claims.length },
    { k: "lost", label: "My Lost", count: myLost.length },
    { k: "found", label: "My Found", count: myFound.length },
    { k: "received", label: "On My Posts", count: received.length },
  ];

  return (
    <main className="cf-shell min-h-dvh flex flex-col pb-20">
      <HeaderBar
        left={<div className="text-[17px] font-bold tracking-tight">My Activity</div>}
        right={
          <Link href="/me" className="w-8 h-8 flex items-center justify-center">
            <Icon.user size={18} stroke="#8A9AA8" />
          </Link>
        }
      />
      <div className="flex gap-4 px-4 pt-3 bg-white border-b border-[rgba(70,75,85,0.10)] overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className="pt-1 pb-2.5 -mb-px whitespace-nowrap text-[13px]"
            style={{
              fontWeight: tab === t.k ? 600 : 500,
              color: tab === t.k ? "#3F5A6B" : "#8A9AA8",
              borderBottom: `2px solid ${tab === t.k ? "#A8C4D9" : "transparent"}`,
            }}
          >
            {t.label} {t.count > 0 && <span className="text-cf-slate ml-0.5">({t.count})</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3">
        {tab === "claims" && (
          claims.length === 0 ? (
            <EmptyState title="No claims yet" body="When you claim a found item it appears here." />
          ) : (
            claims.map((c) => (
              <Link key={c.id} href={`/chat/${c.id}`}>
                <Card className="overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <ItemThumb category="other" tone="blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="text-sm font-semibold truncate">{c.name}</div>
                        <StatusPill kind={c.status} />
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Icon.pin size={11} stroke="#8A9AA8" />
                        <span className="text-[11px] text-cf-slate truncate">{c.loc}</span>
                      </div>
                      <div className="text-[11px] text-cf-slate mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )
        )}

        {tab === "lost" && (
          myLost.length === 0 ? (
            <EmptyState title="Nothing lost — yet" body="Posts you tag 'Lost' will appear here." />
          ) : (
            myLost.map((it) => <ListingRow key={it.id} item={it} />)
          )
        )}

        {tab === "found" && (
          myFound.length === 0 ? (
            <EmptyState title="No found items posted" body="When you post something you found, it appears here." />
          ) : (
            myFound.map((it) => <ListingRow key={it.id} item={it} />)
          )
        )}

        {tab === "received" && (
          received.length === 0 ? (
            <EmptyState title="No claims on your posts" body="When someone claims a listing of yours, it shows up here." />
          ) : (
            received.map((c) => (
              <Link key={c.id} href={`/chat/${c.id}`}>
                <Card className="overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <ItemThumb category="other" tone="sage" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="text-sm font-semibold truncate">{c.name}</div>
                        <StatusPill kind={c.status} />
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Icon.pin size={11} stroke="#8A9AA8" />
                        <span className="text-[11px] text-cf-slate truncate">{c.loc}</span>
                      </div>
                      <div className="text-[11px] text-cf-slate mt-1">
                        {c.status === "pending" ? "Tap to review →" : new Date(c.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function ListingRow({ item }: { item: Item }) {
  return (
    <Link href={`/listings/${item.id}`}>
      <Card className="overflow-hidden">
        <div className="flex gap-3 p-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <ItemThumb category="other" tone="blue" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2">
              <div className="text-sm font-semibold truncate">{item.name}</div>
              <StatusPill kind={item.status} />
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <Icon.pin size={11} stroke="#8A9AA8" />
              <span className="text-[11px] text-cf-slate truncate">{item.loc}</span>
              <span className="text-[11px] text-cf-slate">· {new Date(item.when).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

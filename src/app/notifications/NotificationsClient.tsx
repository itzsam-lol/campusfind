"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui";
import { HeaderBar } from "@/components/header-bar";
import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/icons";
import { api } from "@/lib/api-client";

type N = {
  id: string;
  kind: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

const iconFor = (kind: string) => {
  switch (kind) {
    case "claim_approved":
      return { icon: Icon.check, fg: "#3A6452", bg: "#C8DDD1" };
    case "claim_received":
      return { icon: Icon.alert, fg: "#7A5A1F", bg: "#F8EBC8" };
    case "claim_rejected":
      return { icon: Icon.close, fg: "#8A3A3A", bg: "#F5C0C0" };
    case "broadcast":
      return { icon: Icon.megaphone, fg: "#3F5A6B", bg: "#D6E8F7" };
    case "new_match":
      return { icon: Icon.search, fg: "#3F5A6B", bg: "#D6E8F7" };
    case "desk_drop":
      return { icon: Icon.desk, fg: "#566472", bg: "#F0EDE8" };
    default:
      return { icon: Icon.bell, fg: "#566472", bg: "#F0EDE8" };
  }
};

function bucket(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return "Today";
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return "Earlier";
}

export default function NotificationsClient({ initial }: { initial: N[] }) {
  const [items, setItems] = useState(initial);

  async function markAll() {
    await api("/api/notifications", { method: "POST" });
    setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  }

  const groups: Record<string, N[]> = {};
  for (const n of items) {
    const k = bucket(n.createdAt);
    (groups[k] = groups[k] || []).push(n);
  }
  const order = ["Today", "Yesterday", "Earlier"].filter((k) => groups[k]?.length);

  return (
    <main className="cf-shell min-h-dvh flex flex-col pb-20">
      <HeaderBar
        left={<div className="text-[17px] font-bold tracking-tight">Notifications</div>}
        right={
          items.some((n) => !n.read) ? (
            <button onClick={markAll} className="text-xs font-medium text-cf-blueDark">
              Mark all as read
            </button>
          ) : null
        }
      />
      <div className="flex-1 px-4 pt-1">
        {items.length === 0 && <EmptyState title="No notifications" body="You'll see claim updates and broadcasts here." />}
        {order.map((bk) => (
          <div key={bk}>
            <div className="text-[11px] font-semibold text-cf-slate uppercase tracking-wider pt-3.5 pb-2">{bk}</div>
            <div className="flex flex-col gap-2">
              {groups[bk].map((n) => {
                const { icon: I, fg, bg } = iconFor(n.kind);
                return (
                  <div
                    key={n.id}
                    className="bg-white px-3.5 py-3 rounded-lg border border-[rgba(70,75,85,0.10)] flex gap-3"
                  >
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: bg }}>
                      <I size={16} stroke={fg} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="text-sm font-semibold leading-tight">{n.title}</div>
                        <span className="text-[11px] text-cf-slate whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="text-[13px] text-cf-text2 mt-0.5 leading-relaxed">{n.body}</div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-cf-blue mt-1.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}

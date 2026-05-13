// Mobile bottom navigation bar.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

const TABS = [
  { href: "/home", label: "Home", icon: Icon.home },
  { href: "/activity", label: "Activity", icon: Icon.list },
  { href: "/post", label: "Post", icon: Icon.plus, primary: true },
  { href: "/notifications", label: "Alerts", icon: Icon.bell },
  { href: "/me", label: "Me", icon: Icon.user },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-[420px] bg-white border-t border-[rgba(70,75,85,0.10)] z-40"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="grid grid-cols-5 h-14">
        {TABS.map((t) => {
          const active = path === t.href || path.startsWith(t.href + "/");
          const I = t.icon;
          if (t.primary) {
            return (
              <Link key={t.href} href={t.href} className="flex items-center justify-center -mt-6">
                <span className="w-14 h-14 rounded-full bg-cf-blue shadow-fab flex items-center justify-center">
                  <I size={26} stroke="#2A3340" />
                </span>
              </Link>
            );
          }
          return (
            <Link key={t.href} href={t.href} className="flex flex-col items-center justify-center gap-0.5">
              <I size={22} stroke={active ? "#3F5A6B" : "#8A9AA8"} strokeWidth={active ? 2 : 1.75} />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? "#3F5A6B" : "#8A9AA8" }}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

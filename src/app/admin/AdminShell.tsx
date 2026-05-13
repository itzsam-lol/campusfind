"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, Logo } from "@/components/icons";
import { api } from "@/lib/api-client";

const NAV = [
  { href: "/admin", label: "Overview", icon: Icon.grid },
  { href: "/admin/listings", label: "Listings", icon: Icon.list },
  { href: "/admin/claims", label: "Claims", icon: Icon.thumbup },
  { href: "/admin/users", label: "Users", icon: Icon.users },
  { href: "/admin/broadcasts", label: "Broadcasts", icon: Icon.megaphone },
];

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { email: string; campus: string };
}) {
  const path = usePathname();
  const router = useRouter();
  const initials = user.email
    .split("@")[0]
    .split(/[._]/)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);

  return (
    <div className="min-h-dvh flex bg-cf-bg text-cf-text">
      {/* Sidebar — hidden on mobile, fixed on md+ */}
      <aside className="hidden md:flex w-[232px] bg-white border-r border-[rgba(70,75,85,0.10)] flex-col px-3.5 py-5">
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <Logo size={28} />
          <div>
            <div className="text-sm font-bold">CampusFind</div>
            <div className="text-[10px] text-cf-slate">Admin · {user.campus}</div>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          {NAV.map((n) => {
            const active = path === n.href || (n.href !== "/admin" && path.startsWith(n.href));
            const I = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-3 h-9 px-3 rounded-lg relative"
                style={{
                  background: active ? "rgba(214,232,247,0.5)" : "transparent",
                  color: active ? "#3F5A6B" : "#566472",
                  fontWeight: active ? 600 : 500,
                  fontSize: 13,
                }}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded bg-cf-blue" />}
                <I size={16} stroke={active ? "#3F5A6B" : "#8A9AA8"} />
                {n.label}
              </Link>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="rounded-xl border border-[rgba(70,75,85,0.10)] p-3" style={{ background: "#F7F4EF" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#C8DDD1", color: "#3A6452" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{user.email}</div>
              <div className="text-[10px] text-cf-slate">Admin · {user.campus}</div>
            </div>
          </div>
          <button
            onClick={async () => {
              await api("/api/auth/logout", { method: "POST" });
              router.replace("/login");
            }}
            className="mt-3 w-full h-8 rounded-md bg-white border border-[rgba(70,75,85,0.18)] text-xs font-medium text-cf-slateDk"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 w-full bg-white border-b border-[rgba(70,75,85,0.10)] fixed top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo size={22} />
          <span className="font-bold text-sm">CampusFind Admin</span>
        </div>
        <Link href="/home" className="text-xs text-cf-slateDk">Exit</Link>
      </div>

      <main className="flex-1 overflow-auto p-6 md:p-8 pt-20 md:pt-8">
        {/* Mobile nav as horizontal tabs */}
        <div className="md:hidden flex gap-3 overflow-x-auto no-scrollbar mb-4 -mx-6 px-6">
          {NAV.map((n) => {
            const active = path === n.href || (n.href !== "/admin" && path.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className="whitespace-nowrap text-[13px] py-1.5 -mb-px"
                style={{
                  fontWeight: active ? 600 : 500,
                  color: active ? "#3F5A6B" : "#8A9AA8",
                  borderBottom: `2px solid ${active ? "#A8C4D9" : "transparent"}`,
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
        {children}
      </main>
    </div>
  );
}

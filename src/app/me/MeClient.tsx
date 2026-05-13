"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { HeaderBar } from "@/components/header-bar";
import { BottomNav } from "@/components/bottom-nav";
import { Icon } from "@/components/icons";
import { api } from "@/lib/api-client";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  campus: string;
  createdAt: Date;
};

export default function MeClient({ user, stats }: { user: User; stats: { posted: number; claimed: number; returned: number } }) {
  const router = useRouter();
  const initials =
    (user.name || user.email.split("@")[0])
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <main className="cf-shell min-h-dvh flex flex-col pb-20">
      <HeaderBar left={<div className="text-[17px] font-bold tracking-tight">Profile</div>} />
      <div className="p-4 flex flex-col gap-3">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold" style={{ background: "#C8DDD1", color: "#3A6452" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold truncate">{user.name || user.email.split("@")[0]}</div>
            <div className="text-xs text-cf-slate truncate">{user.email}</div>
            <div className="text-[11px] text-cf-slateDk mt-0.5">{user.campus} · {user.role === "admin" ? "Admin" : "Student"}</div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Posted" value={stats.posted} />
          <Stat label="Claimed" value={stats.claimed} />
          <Stat label="Returned" value={stats.returned} />
        </div>

        {user.role === "admin" && (
          <Link href="/admin">
            <Button kind="secondary">
              <Icon.settings size={16} stroke="#3F5A6B" /> Open Admin Dashboard
            </Button>
          </Link>
        )}
        <Button kind="ghost" onClick={logout}>
          <Icon.logout size={16} stroke="#5C6773" /> Sign out
        </Button>
      </div>
      <BottomNav />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-3 text-center">
      <div className="text-2xl font-semibold text-cf-text">{value}</div>
      <div className="text-[11px] text-cf-slate uppercase tracking-wider mt-1">{label}</div>
    </Card>
  );
}

// Login: email + campus → request OTP.
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { Icon, Logo } from "@/components/icons";
import { api, ApiError } from "@/lib/api-client";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("anjali.s@igdtuw.ac.in");
  const [campus, setCampus] = useState<"IGDTUW" | "IIIT Delhi">("IGDTUW");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api<{ devCode?: string }>("/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), campus }),
      });
      if (res.devCode) setDevCode(res.devCode);
      const next = search.get("next") || "/home";
      const params = new URLSearchParams({ email: email.trim().toLowerCase(), next });
      if (res.devCode) params.set("dev", res.devCode);
      router.push(`/verify?${params.toString()}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not send code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="cf-shell flex flex-col" style={{ background: "#EEF3EF" }}>
      <div className="flex-1 flex flex-col justify-center p-5 pt-14">
        <div className="flex flex-col items-center gap-1.5 mb-7">
          <Logo size={40} />
          <div className="text-base font-semibold text-cf-slateDk mt-1.5">CampusFind</div>
        </div>

        <Card className="p-6 rounded-2xl">
          <form onSubmit={submit}>
            <div className="text-lg font-semibold text-cf-text mb-1">
              Sign in with College Email
            </div>
            <div className="text-xs text-cf-slate mb-4">
              We'll send a one-time code to verify.
            </div>

            <label className="text-[11px] font-semibold text-cf-slateDk uppercase tracking-wider">
              Email
            </label>
            <Input
              type="email"
              autoComplete="email"
              required
              placeholder="yourname@igdtuw.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 mb-3.5"
            />

            <label className="text-[11px] font-semibold text-cf-slateDk uppercase tracking-wider">
              Campus
            </label>
            <div className="relative mt-1.5 mb-3.5">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full h-11 px-3 bg-cf-card border border-[rgba(70,75,85,0.18)] rounded-[4px] flex items-center justify-between text-sm text-cf-text"
              >
                <span>{campus}</span>
                <Icon.chevDown size={16} stroke="#8A9AA8" />
              </button>
              {open && (
                <div className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-cf2 border border-[rgba(70,75,85,0.10)] overflow-hidden z-10">
                  {(["IGDTUW", "IIIT Delhi"] as const).map((c, i) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => {
                        setCampus(c);
                        setOpen(false);
                      }}
                      className={`block w-full text-left px-3.5 py-3 text-sm text-cf-text ${i ? "border-t border-[rgba(70,75,85,0.10)]" : ""}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 mb-4 rounded-lg" style={{ background: "rgba(214,232,247,0.4)" }}>
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-[11px] font-bold text-cf-blueDark">
                {campus === "IGDTUW" ? "IG" : "IIIT"}
              </div>
              <div className="text-xs text-cf-slateDk">{campus} · Delhi</div>
            </div>

            {error && (
              <div className="mb-3 text-sm text-cf-redDark bg-cf-red/40 rounded-md px-3 py-2">{error}</div>
            )}

            <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send OTP"}</Button>
          </form>
        </Card>

        <div className="text-center text-xs text-cf-slate mt-4">
          Your college email is all you need.
        </div>

        {devCode && (
          <div className="text-center text-xs mt-3 text-cf-amberDark">
            Dev OTP: <code className="font-mono font-bold">{devCode}</code>
          </div>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="cf-shell" />}>
      <LoginInner />
    </Suspense>
  );
}

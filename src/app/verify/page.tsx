"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { api, ApiError } from "@/lib/api-client";

function VerifyInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = sp.get("email") || "";
  const devCode = sp.get("dev");
  const next = sp.get("next") || "/home";

  const [digits, setDigits] = useState<string[]>(() => {
    const arr = ["", "", "", "", "", ""];
    if (devCode && /^\d{6}$/.test(devCode)) {
      for (let i = 0; i < 6; i++) arr[i] = devCode[i];
    }
    return arr;
  });
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(42);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function update(i: number, v: string) {
    const ch = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => {
      const n = [...d];
      n[i] = ch;
      return n;
    });
    if (ch && i < 5) refs.current[i + 1]?.focus();
  }

  function back(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  async function submit() {
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      router.replace(next);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setCooldown(45);
    try {
      // Caller must still pass campus, default to IGDTUW; in practice we'd
      // store it from /login. We re-derive from email domain when possible.
      const domain = email.split("@")[1] || "";
      const campus = domain.includes("iiitd") ? "IIIT Delhi" : "IGDTUW";
      await api("/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email, campus }),
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not resend");
    }
  }

  return (
    <main className="cf-shell flex flex-col" style={{ background: "#EEF3EF" }}>
      <div className="flex-1 flex flex-col justify-center p-5 pt-14">
        <Card className="p-6 rounded-2xl">
          <div className="text-lg font-semibold text-cf-text mb-1">Enter verification code</div>
          <div className="text-xs text-cf-slate mb-5">
            Sent to <span className="text-cf-slateDk font-medium">{email}</span>
          </div>

          <div className="flex gap-2 mb-4">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                value={d}
                onChange={(e) => update(i, e.target.value)}
                onKeyDown={(e) => back(i, e)}
                className="flex-1 h-12 rounded-lg bg-cf-card text-center text-xl font-semibold text-cf-text"
                style={{
                  border: `1.5px solid ${d ? "#A8C4D9" : "rgba(70,75,85,0.18)"}`,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={resend}
              disabled={cooldown > 0}
              className="text-[13px] font-medium text-cf-blueDark disabled:opacity-50"
            >
              Resend OTP
            </button>
            <span className="text-xs text-cf-slate">
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Ready to resend"}
            </span>
          </div>

          {error && (
            <div className="mb-3 text-sm text-cf-redDark bg-cf-red/40 rounded-md px-3 py-2">{error}</div>
          )}

          <Button onClick={submit} disabled={busy}>
            {busy ? "Verifying…" : "Verify & Continue"}
          </Button>
        </Card>

        <div className="text-center text-xs text-cf-slate mt-4">
          Use the same email you signed up with.
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<main className="cf-shell" />}>
      <VerifyInner />
    </Suspense>
  );
}

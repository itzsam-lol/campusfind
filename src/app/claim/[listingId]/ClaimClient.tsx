"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PhotoThumb, StatusPill, Textarea } from "@/components/ui";
import { HeaderBar } from "@/components/header-bar";
import { Icon } from "@/components/icons";
import { api, ApiError } from "@/lib/api-client";

type Listing = {
  id: string;
  title: string;
  locationName: string;
  category: string;
  createdAt: string;
  photos: { id: string; data: string; tone: string | null }[];
};

export default function ClaimClient({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [txt, setTxt] = useState("");
  const [sent, setSent] = useState<{ claimId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const count = txt.length;

  async function submit() {
    if (count < 20) return;
    setBusy(true);
    setErr(null);
    try {
      const data = await api<{ claim: { id: string } }>(`/api/listings/${listing.id}/claim`, {
        method: "POST",
        body: JSON.stringify({ description: txt }),
      });
      setSent({ claimId: data.claim.id });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not send claim");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <main className="cf-shell min-h-dvh flex flex-col">
        <HeaderBar
          left={
            <button onClick={() => router.replace(`/listings/${listing.id}`)} className="w-8 h-8 flex items-center justify-center">
              <Icon.close size={18} stroke="#566472" />
            </button>
          }
          title="Claim Sent"
        />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-6">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-5" style={{ background: "#C8DDD1" }}>
            <Icon.check size={36} stroke="#3A6452" strokeWidth={2} />
          </div>
          <div className="text-xl font-semibold text-center mb-1.5">Your claim has been sent</div>
          <div className="text-[13px] text-cf-text2 text-center leading-relaxed max-w-[280px] mb-6">
            You'll be notified once the finder reviews it. Most claims are reviewed within 24 hours.
          </div>
          <Card className="w-full p-3 flex items-center gap-3">
            <div className="w-[52px] h-[52px] rounded-lg overflow-hidden">
              <PhotoThumb data={listing.photos[0]?.data} category={listing.category} ratio="1/1" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{listing.title}</div>
              <div className="text-[11px] text-cf-slate mt-0.5">{listing.locationName}</div>
            </div>
            <StatusPill kind="pending" />
          </Card>
          <Button className="mt-6" onClick={() => router.replace(`/chat/${sent.claimId}`)}>
            Open chat
          </Button>
          <button className="mt-2 text-sm text-cf-slateDk" onClick={() => router.replace("/home")}>
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="cf-shell min-h-dvh flex flex-col">
      <HeaderBar back={`/listings/${listing.id}`} left={<span className="text-sm text-cf-slateDk">Back</span>} />
      <div className="flex-1 overflow-auto px-4 py-2">
        <div className="flex items-center gap-2.5 mt-2 mb-1.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#D6E8F7" }}>
            <Icon.lock size={18} stroke="#3F5A6B" />
          </div>
          <div className="text-xl font-semibold">Prove Ownership</div>
        </div>
        <p className="text-[13px] text-cf-text2 leading-relaxed mb-4">
          Describe something only the true owner would know — a scratch, a sticker, what's inside. This is private and not shown publicly.
        </p>

        <Card className="p-3 flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg overflow-hidden">
            <PhotoThumb data={listing.photos[0]?.data} category={listing.category} ratio="1/1" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate">{listing.title}</div>
            <div className="text-[11px] text-cf-slate mt-0.5">{listing.locationName}</div>
          </div>
        </Card>

        <label className="text-[11px] font-semibold text-cf-slateDk uppercase tracking-wider">
          Your description
        </label>
        <Textarea
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          placeholder="e.g. Black with red trim, has a scratch on the back of the left bud."
          rows={6}
          maxLength={2000}
          className="mt-1.5"
          style={{ borderColor: count >= 20 ? "#A8C4D9" : undefined }}
        />
        <div className="flex justify-between mt-1.5 text-[11px]">
          <span style={{ color: count >= 20 ? "#3A6452" : "#8A9AA8" }}>
            {count >= 20 ? "✓ Looks detailed enough" : `Min 20 characters · ${20 - count} more needed`}
          </span>
          <span className="text-cf-slate">{count}/2000</span>
        </div>
        {err && <div className="mt-3 text-sm text-cf-redDark bg-cf-red/40 rounded-md px-3 py-2">{err}</div>}
      </div>
      <div className="px-4 py-3.5 bg-white border-t border-[rgba(70,75,85,0.10)]">
        <Button onClick={submit} disabled={count < 20 || busy}>
          {busy ? "Sending…" : "Send Claim Request"}
        </Button>
      </div>
    </main>
  );
}

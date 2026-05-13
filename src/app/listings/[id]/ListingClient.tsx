"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CategoryBadge, PhotoThumb, StatusPill } from "@/components/ui";
import { HeaderBar } from "@/components/header-bar";
import { Icon } from "@/components/icons";
import { api, ApiError } from "@/lib/api-client";

type Listing = {
  id: string;
  kind: string;
  title: string;
  description: string;
  category: string;
  campus: string;
  locationName: string;
  status: string;
  handover: string;
  happenedAt: string;
  createdAt: string;
  photos: { id: string; data: string; tone: string | null }[];
};

export default function ListingClient({
  listing,
  isOwner,
  myClaim,
}: {
  listing: Listing;
  isOwner: boolean;
  myClaim: { id: string; status: string } | null;
}) {
  const [dot, setDot] = useState(0);
  const photos = listing.photos.length > 0 ? listing.photos : [null];

  const action = (() => {
    if (isOwner) return null;
    if (listing.status !== "open" && !myClaim) return null;
    if (myClaim) {
      if (myClaim.status === "approved") {
        return { label: "Open chat", href: `/chat/${myClaim.id}` };
      }
      return { label: `Claim ${myClaim.status}`, href: `/chat/${myClaim.id}` };
    }
    return { label: "This is Mine — Claim Item", href: `/claim/${listing.id}` };
  })();

  return (
    <main className="cf-shell min-h-dvh flex flex-col">
      <HeaderBar
        back="/home"
        left={<span className="text-sm text-cf-slateDk font-medium">Home Feed</span>}
        right={
          <button className="w-8 h-8 flex items-center justify-center" title="Report" aria-label="Report">
            <Icon.flag size={18} stroke="#8A9AA8" />
          </button>
        }
      />
      <div className="flex-1 overflow-auto pb-6">
        <div className="relative">
          <PhotoThumb
            data={photos[dot]?.data || undefined}
            category={listing.category}
            tone={photos[dot]?.tone || undefined}
            ratio="4/3"
          />
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDot(i)}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === dot ? 18 : 6,
                    background: i === dot ? "#fff" : "rgba(255,255,255,0.55)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <CategoryBadge className="bg-cf-card capitalize">{listing.category}</CategoryBadge>
            <StatusPill kind={listing.status} />
          </div>
          <h1 className="text-xl font-semibold leading-tight mb-1">{listing.title}</h1>
          <div className="text-xs text-cf-slate mb-4">
            Posted {new Date(listing.createdAt).toLocaleString()} · {listing.kind === "found" ? "Found" : "Lost"}
          </div>

          <p className="text-sm text-cf-text2 leading-relaxed mb-5">{listing.description}</p>

          <Card className="p-3.5 flex items-center gap-3 mb-2.5">
            <Icon.lock size={18} stroke="#8A9AA8" />
            <div className="flex-1">
              <div className="text-[13px] font-medium">
                {isOwner ? "You posted this" : `${listing.kind === "found" ? "Found" : "Lost"} by: Anonymous`}
              </div>
              <div className="text-[11px] text-cf-slate mt-0.5">
                Identity revealed after claim approval
              </div>
            </div>
          </Card>

          <Card className="p-3.5 flex items-center gap-3 mb-5">
            <Icon.desk size={18} stroke="#8A9AA8" />
            <div className="flex-1">
              <div className="text-[13px] font-medium">
                {listing.handover === "desk"
                  ? "Will deposit at Main Building L&F Desk"
                  : "Finder will keep it until claimed"}
              </div>
              <div className="text-[11px] text-cf-slate mt-0.5">
                {listing.locationName}
              </div>
            </div>
          </Card>

          {isOwner ? (
            <div className="flex flex-col gap-2">
              <OwnerActions listingId={listing.id} status={listing.status} />
            </div>
          ) : action ? (
            <Link href={action.href}>
              <Button kind="sage">
                <Icon.check size={18} stroke="#3A6452" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button kind="ghost" disabled>
              {listing.status === "claimed" ? "Already claimed" : listing.status === "returned" ? "Returned" : "Closed"}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function OwnerActions({ listingId, status }: { listingId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function setStatus(s: "open" | "closed") {
    setBusy(true);
    setErr(null);
    try {
      await api(`/api/listings/${listingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: s }),
      });
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {err && <div className="text-sm text-cf-redDark">{err}</div>}
      {status === "open" ? (
        <Button kind="secondary" disabled={busy} onClick={() => setStatus("closed")}>
          Close listing
        </Button>
      ) : status === "closed" ? (
        <Button kind="secondary" disabled={busy} onClick={() => setStatus("open")}>
          Reopen listing
        </Button>
      ) : (
        <Button kind="ghost" disabled>Listing {status}</Button>
      )}
    </>
  );
}

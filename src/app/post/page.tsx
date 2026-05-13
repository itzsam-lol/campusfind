"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CategoryBadge, Input, PhotoThumb, StatusPill, Textarea } from "@/components/ui";
import { HeaderBar } from "@/components/header-bar";
import { Icon } from "@/components/icons";
import { api, ApiError } from "@/lib/api-client";

const CATS = [
  { k: "electronics", label: "Electronics" },
  { k: "documents", label: "Documents" },
  { k: "keys", label: "Keys" },
  { k: "clothing", label: "Clothing" },
  { k: "accessories", label: "Accessories" },
  { k: "other", label: "Other" },
] as const;

type Cat = (typeof CATS)[number]["k"];

function PostInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialKind = (sp.get("kind") === "lost" ? "lost" : "found") as "found" | "lost";

  const [step, setStep] = useState(1);
  const [kind] = useState<"found" | "lost">(initialKind);
  const [cat, setCat] = useState<Cat>("electronics");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const [handover, setHandover] = useState<"desk" | "keep">("desk");
  const [happenedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [photos, setPhotos] = useState<{ data: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || photos.length >= 4) return;
    if (!f.type.startsWith("image/") || f.size > 1.5 * 1024 * 1024) {
      setErr("Pick a JPG/PNG/WEBP image under 1.5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      if (data.startsWith("data:image/")) {
        setPhotos((p) => [...p, { data }]);
        setErr(null);
      }
    };
    reader.readAsDataURL(f);
  }

  function canContinue(): boolean {
    if (step === 1) return !!cat;
    if (step === 2) {
      return title.trim().length >= 3 && desc.trim().length >= 10 && loc.trim().length >= 2;
    }
    return true;
  }

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const data = await api<{ listing: { id: string } }>("/api/listings", {
        method: "POST",
        body: JSON.stringify({
          kind,
          title: title.trim(),
          description: desc.trim(),
          category: cat,
          locationName: loc.trim(),
          happenedAt: new Date(happenedAt).toISOString(),
          handover,
          photos: photos.map((p) => ({ data: p.data })),
        }),
      });
      router.replace(`/listings/${data.listing.id}`);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="cf-shell min-h-dvh flex flex-col">
      <HeaderBar
        back={step > 1 ? undefined : "/home"}
        left={
          <>
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)} className="w-8 h-8 flex items-center justify-center">
                <Icon.back size={20} stroke="#566472" />
              </button>
            )}
            <span className="text-sm font-semibold text-cf-text">
              {kind === "found" ? "Post a Found Item" : "Post a Lost Item"}
            </span>
          </>
        }
        right={<span className="text-xs text-cf-slate">{step} of 3</span>}
      />

      <div className="px-4 pt-4 pb-2 bg-white border-b border-[rgba(70,75,85,0.10)]">
        <div className="flex items-center gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5 flex-1 last:flex-none">
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-semibold"
                style={{
                  background: i <= step ? "#A8C4D9" : "#F0EDE8",
                  color: i <= step ? "#2A3340" : "#8A9AA8",
                }}
              >
                {i < step ? <Icon.check size={12} stroke="#2A3340" /> : i}
              </div>
              {i < 3 && (
                <div className="flex-1 h-0.5 rounded" style={{ background: i < step ? "#A8C4D9" : "rgba(70,75,85,0.18)" }} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] mt-2.5 text-cf-slate">
          <span>Category</span>
          <span>Details</span>
          <span>Review</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {step === 1 && (
          <>
            <div className="text-lg font-semibold mb-1">
              {kind === "found" ? "What did you find?" : "What did you lose?"}
            </div>
            <div className="text-[13px] text-cf-slate mb-4">
              Pick the closest category — you can add details next.
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CATS.map((c) => {
                const active = cat === c.k;
                const CatIcon = c.k === "electronics" ? Icon.laptop : c.k === "documents" ? Icon.doc : c.k === "keys" ? Icon.key : c.k === "clothing" ? Icon.shirt : c.k === "accessories" ? Icon.bag : Icon.package;
                return (
                  <button
                    key={c.k}
                    onClick={() => setCat(c.k)}
                    className="rounded-xl flex flex-col items-center justify-center gap-2.5 py-6"
                    style={{
                      aspectRatio: "1.1/1",
                      background: active ? "#D6E8F7" : "#fff",
                      border: `1px solid ${active ? "#A8C4D9" : "rgba(70,75,85,0.18)"}`,
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ background: active ? "#fff" : "#F0EDE8" }}
                    >
                      <CatIcon size={22} stroke={active ? "#3F5A6B" : "#566472"} />
                    </div>
                    <span className="text-[13px] font-medium">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-lg font-semibold mb-1">Add details</div>
            <div className="text-[13px] text-cf-slate mb-4">Photos help owners recognise the item.</div>

            <div className="flex gap-2.5 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <label
                  key={i}
                  className="flex-1 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                  style={{
                    aspectRatio: 1,
                    background: photos[i] ? "transparent" : i === 0 ? "#F0EDE8" : "transparent",
                    border: photos[i] ? "0.5px solid rgba(70,75,85,0.18)" : i === 0 ? "0.5px solid rgba(70,75,85,0.18)" : "1.5px dashed rgba(70,75,85,0.18)",
                  }}
                >
                  {photos[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[i].data} alt="" className="w-full h-full object-cover" />
                  ) : i === photos.length ? (
                    <>
                      <Icon.camera size={22} stroke="#8A9AA8" />
                      <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickPhoto} />
                    </>
                  ) : null}
                </label>
              ))}
            </div>

            <Field label="Item Name">
              <Input
                placeholder="e.g. Black Wired Earbuds — JBL"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
            </Field>

            <Field label="Description">
              <Textarea
                placeholder="Add identifiers, color, brand, condition…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                maxLength={2000}
              />
            </Field>

            <Field label="Location">
              <Input
                placeholder="e.g. CS Block, 2F"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                leadingIcon={<Icon.pin size={16} stroke="#8A9AA8" />}
                maxLength={120}
              />
            </Field>

            <Card className="p-3.5 flex items-center gap-3 mt-1.5">
              <div className="flex-1">
                <div className="text-[13px] font-medium">
                  {handover === "keep" ? "I'll keep it until claimed" : "Drop at Lost & Found Desk"}
                </div>
                <div className="text-[11px] text-cf-slate mt-0.5">
                  {handover === "keep" ? "Owner can message you to coordinate" : "Main Building, 9am–5pm"}
                </div>
              </div>
              <button
                onClick={() => setHandover((h) => (h === "desk" ? "keep" : "desk"))}
                className="w-10 h-6 rounded-full relative"
                style={{ background: handover === "keep" ? "#E8D2A6" : "#A8C4D9" }}
                aria-label="Toggle handover"
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow"
                  style={{ left: handover === "keep" ? 18 : 2 }}
                />
              </button>
            </Card>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-lg font-semibold mb-1">Review listing</div>
            <div className="text-[13px] text-cf-slate mb-4">Looks right? Submit to publish.</div>
            <Card className="overflow-hidden mb-4">
              <PhotoThumb data={photos[0]?.data} category={cat} ratio="16/9" />
              <div className="p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <CategoryBadge className="bg-cf-card capitalize">{cat}</CategoryBadge>
                  <StatusPill kind="open" />
                </div>
                <div className="text-[15px] font-semibold mb-2">{title}</div>
                <div className="text-[12px] text-cf-text2 leading-relaxed mb-2">{desc}</div>
                <SummaryRow icon={<Icon.pin size={14} stroke="#8A9AA8" />} label="Location" value={loc} />
                <SummaryRow
                  icon={<Icon.calendar size={14} stroke="#8A9AA8" />}
                  label="When"
                  value={new Date(happenedAt).toLocaleString()}
                />
                <SummaryRow
                  icon={<Icon.desk size={14} stroke="#8A9AA8" />}
                  label="Handover"
                  value={handover === "desk" ? "L&F Desk" : "Keep with me"}
                />
              </div>
            </Card>
            <div className="rounded-lg flex gap-2.5 px-3 py-2 mb-3 text-xs text-cf-slateDk" style={{ background: "rgba(214,232,247,0.4)" }}>
              <Icon.lock size={14} stroke="#3F5A6B" />
              Your name stays hidden until a claim is approved.
            </div>
          </>
        )}
        {err && <div className="mt-3 text-sm text-cf-redDark bg-cf-red/40 rounded-md px-3 py-2">{err}</div>}
      </div>

      <div className="px-4 py-3.5 bg-white border-t border-[rgba(70,75,85,0.10)] flex gap-2.5">
        {step > 1 && (
          <Button kind="secondary" full={false} onClick={() => setStep((s) => s - 1)} className="w-24">
            Back
          </Button>
        )}
        <Button
          disabled={!canContinue() || busy}
          onClick={() => (step < 3 ? setStep((s) => s + 1) : submit())}
        >
          {busy ? "Saving…" : step === 3 ? "Submit Listing" : "Continue"}
        </Button>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="text-[11px] font-semibold text-cf-slateDk uppercase tracking-wider">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {icon}
      <span className="text-[12px] text-cf-slate w-16">{label}</span>
      <span className="text-[12px] font-medium text-cf-text">{value}</span>
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<main className="cf-shell" />}>
      <PostInner />
    </Suspense>
  );
}

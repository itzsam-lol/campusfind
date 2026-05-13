"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { HeaderBar } from "@/components/header-bar";
import { Icon } from "@/components/icons";
import { api, ApiError } from "@/lib/api-client";

type Msg = { id: string; kind: string; body: string; fromMe: boolean; createdAt: string };

export default function ChatClient({
  claimId,
  initialStatus,
  listingTitle,
  role,
}: {
  claimId: string;
  initialStatus: string;
  listingTitle: string;
  role: "owner" | "claimant" | "admin";
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [status, setStatus] = useState(initialStatus);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const lastIdRef = useRef<string | null>(null);

  async function load() {
    try {
      const data = await api<{ messages: Msg[]; claim: { status: string } }>(`/api/chats/${claimId}`);
      setMessages(data.messages);
      setStatus(data.claim.status);
      const last = data.messages[data.messages.length - 1]?.id || null;
      if (last !== lastIdRef.current) {
        lastIdRef.current = last;
        queueMicrotask(() => scrollerRef.current?.scrollTo(0, scrollerRef.current.scrollHeight));
      }
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not load chat");
    }
  }

  useEffect(() => {
    void load();
    const t = setInterval(load, 6000); // light polling
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId]);

  async function send() {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    setErr(null);
    try {
      const data = await api<{ message: Msg }>(`/api/chats/${claimId}`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setMessages((m) => [...m, data.message]);
      setDraft("");
      queueMicrotask(() => scrollerRef.current?.scrollTo(0, scrollerRef.current.scrollHeight));
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }

  async function decide(decision: "approve" | "reject") {
    setBusy(true);
    setErr(null);
    try {
      await api(`/api/claims/${claimId}`, { method: "PATCH", body: JSON.stringify({ decision }) });
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not update");
    } finally {
      setBusy(false);
    }
  }

  async function confirmReturn() {
    setBusy(true);
    setErr(null);
    try {
      await api(`/api/claims/${claimId}/confirm-return`, { method: "POST" });
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="cf-shell min-h-dvh flex flex-col">
      <HeaderBar
        back="/activity"
        left={
          <div className="min-w-0">
            <div className="text-[13px] font-semibold truncate">{listingTitle}</div>
            <div className="text-[11px] text-cf-slate">
              {role === "owner" ? "With claimant · Anonymous" : "With finder · Anonymous"}
              {status !== "pending" ? ` · ${status}` : ""}
            </div>
          </div>
        }
        right={
          <button className="w-8 h-8 flex items-center justify-center" aria-label="More">
            <Icon.more size={18} stroke="#8A9AA8" />
          </button>
        }
      />

      <div className="px-4 py-2 border-b border-[rgba(70,75,85,0.10)] flex items-center gap-2" style={{ background: "#F8EBC8" }}>
        <Icon.alert size={14} stroke="#7A5A1F" />
        <span className="text-[11px] text-cf-amberDark">
          This chat is visible to campus admins for dispute resolution
        </span>
      </div>

      {/* Owner decision banner */}
      {role === "owner" && status === "pending" && (
        <div className="px-4 py-3 bg-white border-b border-[rgba(70,75,85,0.10)] flex gap-2 items-center">
          <span className="text-[12px] text-cf-text2 flex-1">Approve this claim to start coordinating?</span>
          <Button kind="sage" full={false} onClick={() => decide("approve")} disabled={busy}>Approve</Button>
          <Button kind="danger" full={false} onClick={() => decide("reject")} disabled={busy}>Reject</Button>
        </div>
      )}

      <div ref={scrollerRef} className="flex-1 overflow-auto p-4 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <div className="text-center text-[12px] text-cf-slate py-8">
            {role === "owner" ? "Waiting on your decision" : "Waiting for the finder to review"}
          </div>
        )}
        {messages.map((m) => {
          if (m.kind === "system") {
            return (
              <div key={m.id} className="self-center max-w-[85%] text-center px-3.5 py-2 rounded-xl text-[12px] font-medium flex items-center gap-2" style={{ background: "#C8DDD1", color: "#3A6452" }}>
                <Icon.check size={14} stroke="#3A6452" strokeWidth={2.2} />
                {m.body}
              </div>
            );
          }
          const me = m.fromMe;
          return (
            <div
              key={m.id}
              className="px-3 py-2.5 text-[13px] leading-relaxed max-w-[78%]"
              style={{
                alignSelf: me ? "flex-end" : "flex-start",
                background: me ? "#A8C4D9" : "#fff",
                color: "#2A3340",
                borderRadius: 14,
                borderBottomRightRadius: me ? 4 : 14,
                borderBottomLeftRadius: me ? 14 : 4,
                border: me ? "0" : "0.5px solid rgba(70,75,85,0.10)",
                boxShadow: me ? "none" : "0 1px 6px rgba(20,30,45,0.06)",
              }}
            >
              {m.body}
            </div>
          );
        })}
      </div>

      {/* Confirm-receipt receipt bar */}
      {status === "approved" && (
        <div className="px-3 pt-2">
          <div className="bg-white rounded-xl px-3 py-2.5 flex items-center gap-2.5" style={{ border: "1px solid #C8DDD1" }}>
            <Icon.check size={18} stroke="#3A6452" />
            <span className="flex-1 text-[13px] font-medium">Got your item? Confirm receipt</span>
            <button
              onClick={confirmReturn}
              className="h-[30px] px-3 rounded-lg text-xs font-semibold"
              style={{ background: "#C8DDD1", color: "#3A6452" }}
              disabled={busy}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {err && <div className="px-3 pt-2 text-sm text-cf-redDark">{err}</div>}

      <div className="px-3 py-2.5 bg-white border-t border-[rgba(70,75,85,0.10)] flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={status === "rejected" ? "Chat closed" : "Message..."}
          disabled={status === "rejected" || busy}
          maxLength={2000}
          className="flex-1 h-10 px-3.5 rounded-full text-sm bg-cf-card outline-0 border-0"
        />
        <button
          onClick={send}
          disabled={busy || !draft.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
          style={{ background: "#A8C4D9" }}
          aria-label="Send"
        >
          <Icon.send size={18} stroke="#2A3340" />
        </button>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { api, ApiError } from "@/lib/api-client";

type B = {
  id: string;
  title: string;
  body: string;
  audience: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
};

export default function BroadcastsPage() {
  const [items, setItems] = useState<B[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "students">("all");
  const [schedule, setSchedule] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function refresh() {
    const data = await api<{ items: B[] }>("/api/admin/broadcasts");
    setItems(data.items);
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/broadcasts", {
        method: "POST",
        body: JSON.stringify({
          title,
          body,
          audience,
          scheduledAt: schedule ? new Date(schedule).toISOString() : undefined,
        }),
      });
      setTitle("");
      setBody("");
      setSchedule("");
      await refresh();
      setMsg({ kind: "ok", text: schedule ? "Broadcast scheduled." : "Broadcast sent." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "Could not save" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Broadcasts</h1>
        <div className="text-sm text-cf-slate mt-1">Push messages to a campus segment.</div>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr,1fr] gap-5">
          <div>
            <Input
              placeholder="Title — e.g. L&F desk hours during exams"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mb-3"
            />
            <Textarea
              placeholder="Write your message…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              maxLength={2000}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Field label="Audience">
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as "all" | "students")}
                className="h-10 w-full px-3 rounded-[4px] bg-cf-card border border-[rgba(70,75,85,0.18)] text-sm"
              >
                <option value="all">All campus users</option>
                <option value="students">Students only</option>
              </select>
            </Field>
            <Field label="Schedule (optional)">
              <input
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="h-10 w-full px-3 rounded-[4px] bg-cf-card border border-[rgba(70,75,85,0.18)] text-sm"
              />
            </Field>
            <div className="flex-1" />
            <Button onClick={submit} disabled={busy || title.length < 3 || body.length < 3}>
              {busy ? "Saving…" : schedule ? "Schedule" : "Send now"}
            </Button>
            {msg && (
              <div
                className="text-xs"
                style={{ color: msg.kind === "ok" ? "#3A6452" : "#8A3A3A" }}
              >
                {msg.text}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Icon.megaphone size={16} stroke="#566472" />
          <div className="text-sm font-semibold">History</div>
        </div>
        <div className="grid gap-3">
          {items.length === 0 && <div className="text-sm text-cf-slate">No broadcasts yet.</div>}
          {items.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{b.title}</div>
                  <div className="text-sm text-cf-text2 mt-1 whitespace-pre-wrap">{b.body}</div>
                </div>
                <span className="text-[11px] text-cf-slate whitespace-nowrap">
                  {b.sentAt
                    ? `Sent ${new Date(b.sentAt).toLocaleString()}`
                    : b.scheduledAt
                    ? `Scheduled ${new Date(b.scheduledAt).toLocaleString()}`
                    : new Date(b.createdAt).toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-cf-slate uppercase tracking-wider">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

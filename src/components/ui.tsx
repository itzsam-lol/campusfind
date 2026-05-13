// Shared UI primitives that match the design tokens.
"use client";

import type React from "react";
import { Tones, CategoryIcon, Icon } from "./icons";

type Kind = "primary" | "secondary" | "sage" | "ghost" | "danger";

export function Button({
  children,
  kind = "primary",
  type = "button",
  full = true,
  disabled,
  onClick,
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  kind?: Kind;
  type?: "button" | "submit";
  full?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const palette: Record<Kind, string> = {
    primary: "bg-cf-blue text-cf-text border-transparent",
    sage: "bg-cf-sage text-cf-sageDark border-transparent",
    secondary: "bg-transparent text-cf-blueDark border-cf-blue",
    ghost: "bg-transparent text-cf-text2 border-transparent",
    danger: "bg-cf-red text-cf-redDark border-transparent",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-12 inline-flex items-center justify-center gap-2 rounded-lg border font-semibold text-[15px]",
        "transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        full ? "w-full" : "px-4",
        palette[kind],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Input({
  leadingIcon,
  className = "",
  ...rest
}: {
  leadingIcon?: React.ReactNode;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div
      className={[
        "flex items-center h-11 px-3 bg-cf-card rounded-[4px] gap-2",
        "border border-[rgba(70,75,85,0.18)]",
        className,
      ].join(" ")}
    >
      {leadingIcon}
      <input
        {...rest}
        className="flex-1 h-full border-0 outline-0 bg-transparent text-sm text-cf-text placeholder:text-cf-slate"
      />
    </div>
  );
}

export function Textarea({
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={[
        "w-full p-3 bg-cf-card rounded-[4px] text-sm text-cf-text leading-relaxed",
        "border border-[rgba(70,75,85,0.18)] resize-none outline-0 placeholder:text-cf-slate",
        className,
      ].join(" ")}
    />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "bg-white rounded-xl shadow-cf border border-[rgba(70,75,85,0.10)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

const statusMap: Record<string, { bg: string; fg: string; label: string }> = {
  open: { bg: "#D6E8F7", fg: "#2C4A5E", label: "Open" },
  claimed: { bg: "#F2E5C6", fg: "#7A5A1F", label: "Claimed" },
  returned: { bg: "#C8DDD1", fg: "#3A6452", label: "Returned" },
  pending: { bg: "#F2E5C6", fg: "#7A5A1F", label: "Pending" },
  approved: { bg: "#C8DDD1", fg: "#3A6452", label: "Approved" },
  rejected: { bg: "#F5C0C0", fg: "#8A3A3A", label: "Rejected" },
  closed: { bg: "#E5E0DA", fg: "#5C6773", label: "Closed" },
  removed: { bg: "#E5E0DA", fg: "#5C6773", label: "Removed" },
  flagged: { bg: "#F5C0C0", fg: "#8A3A3A", label: "Flagged" },
};

export function StatusPill({ kind, className = "" }: { kind: string; className?: string }) {
  const m = statusMap[kind] || statusMap.open;
  return (
    <span
      className={["inline-flex items-center h-[22px] px-2.5 rounded-full text-[11px] font-semibold leading-none whitespace-nowrap", className].join(" ")}
      style={{ background: m.bg, color: m.fg }}
    >
      {m.label}
    </span>
  );
}

export function CategoryBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center h-5 px-2 rounded-md text-[10px] font-semibold uppercase tracking-wide",
        "bg-white/90 backdrop-blur text-cf-text2",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function ItemThumb({
  tone = "blue",
  category = "other",
  className = "",
  ratio = "16/10",
}: {
  tone?: string;
  category?: string;
  className?: string;
  ratio?: string;
}) {
  const [a, b] = Tones[tone] || Tones.blue;
  const C = CategoryIcon[category] || CategoryIcon.other;
  return (
    <div
      className={["w-full flex items-center justify-center relative overflow-hidden", className].join(" ")}
      style={{
        aspectRatio: ratio,
        background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
        color: "rgba(40,55,70,0.4)",
      }}
    >
      <C size={36} stroke="rgba(40,55,70,0.45)" />
    </div>
  );
}

export function PhotoThumb({
  data,
  tone,
  category,
  className = "",
  ratio = "16/10",
}: {
  data?: string;
  tone?: string;
  category?: string;
  className?: string;
  ratio?: string;
}) {
  if (data)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={data}
        alt=""
        className={["w-full object-cover", className].join(" ")}
        style={{ aspectRatio: ratio }}
      />
    );
  return <ItemThumb tone={tone} category={category} className={className} ratio={ratio} />;
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="animate-spin text-cf-blueDark"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  title,
  body,
  icon = <Icon.package size={28} stroke="#8A9AA8" />,
}: {
  title: string;
  body?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 text-cf-text2">
      <div className="w-14 h-14 rounded-full bg-cf-card flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="font-semibold text-cf-text text-base">{title}</div>
      {body && <div className="text-sm mt-1 max-w-xs">{body}</div>}
    </div>
  );
}

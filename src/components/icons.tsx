// Outlined, Lucide-style icons used throughout the app.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Base = ({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

export const Icon = {
  search: (p: IconProps) => (
    <Base {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Base>
  ),
  pin: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </Base>
  ),
  bell: (p: IconProps) => (
    <Base {...p}>
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Base>
  ),
  plus: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  ),
  back: (p: IconProps) => (
    <Base {...p}>
      <path d="m15 5-7 7 7 7" />
    </Base>
  ),
  lock: (p: IconProps) => (
    <Base {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Base>
  ),
  flag: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 21V4" />
      <path d="M4 4h11l-2 3 2 3H4" />
    </Base>
  ),
  desk: (p: IconProps) => (
    <Base {...p}>
      <path d="M3 10h18" />
      <path d="M5 10v8M19 10v8" />
      <path d="M3 6h18v4H3z" />
    </Base>
  ),
  send: (p: IconProps) => (
    <Base {...p}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </Base>
  ),
  camera: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Base>
  ),
  calendar: (p: IconProps) => (
    <Base {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </Base>
  ),
  check: (p: IconProps) => (
    <Base {...p}>
      <path d="m5 12 5 5L20 7" />
    </Base>
  ),
  chev: (p: IconProps) => (
    <Base {...p}>
      <path d="m9 6 6 6-6 6" />
    </Base>
  ),
  chevDown: (p: IconProps) => (
    <Base {...p}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  ),
  close: (p: IconProps) => (
    <Base {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  ),
  alert: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.5" />
    </Base>
  ),
  edit: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="m13 6 4 4" />
    </Base>
  ),
  laptop: (p: IconProps) => (
    <Base {...p}>
      <rect x="3" y="5" width="18" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </Base>
  ),
  doc: (p: IconProps) => (
    <Base {...p}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
    </Base>
  ),
  key: (p: IconProps) => (
    <Base {...p}>
      <circle cx="8" cy="14" r="4" />
      <path d="m11 12 9-9M16 7l2 2" />
    </Base>
  ),
  shirt: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 7 9 4l3 3 3-3 5 3-2 4-3-1v10H9V10L6 11Z" />
    </Base>
  ),
  bag: (p: IconProps) => (
    <Base {...p}>
      <path d="M5 8h14l-1 13H6Z" />
      <path d="M9 8V5a3 3 0 0 1 6 0v3" />
    </Base>
  ),
  more: (p: IconProps) => (
    <Base {...p}>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </Base>
  ),
  user: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </Base>
  ),
  home: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 11 12 4l8 7v9h-5v-6h-6v6H4Z" />
    </Base>
  ),
  grid: (p: IconProps) => (
    <Base {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Base>
  ),
  chart: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 20h16" />
      <path d="M7 16v-5M12 16V8M17 16v-3" />
    </Base>
  ),
  users: (p: IconProps) => (
    <Base {...p}>
      <circle cx="9" cy="9" r="3.5" />
      <path d="M3 20c1-3.5 3.5-5 6-5s5 1.5 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14c2 0 4 1 5 4" />
    </Base>
  ),
  megaphone: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 10v4l11 4V6Z" />
      <path d="M15 10h4v4h-4" />
    </Base>
  ),
  settings: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2 2M7.6 16.4l-2 2M18.4 18.4l-2-2M7.6 7.6l-2-2" />
    </Base>
  ),
  list: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Base>
  ),
  filter: (p: IconProps) => (
    <Base {...p}>
      <path d="M4 5h16l-6 8v6l-4-2v-4Z" />
    </Base>
  ),
  package: (p: IconProps) => (
    <Base {...p}>
      <path d="m3 8 9-5 9 5v8l-9 5-9-5Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </Base>
  ),
  thumbup: (p: IconProps) => (
    <Base {...p}>
      <path d="M7 11v9H4v-9Z" />
      <path d="M7 11h8a2 2 0 0 1 2 2.3l-1 5A2 2 0 0 1 14 20H7" />
      <path d="M11 11V6a2 2 0 0 1 4 0v5" />
    </Base>
  ),
  clock: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Base>
  ),
  logout: (p: IconProps) => (
    <Base {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Base>
  ),
};

export function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="26" cy="26" r="14" stroke="#A8C4D9" strokeWidth="3" />
      <circle cx="26" cy="24" r="4" fill="#3F5A6B" />
      <path d="M37 36l16 16" stroke="#A8C4D9" strokeWidth="4" strokeLinecap="round" />
      <path d="M53 52 L51 58 L45 56 Z" fill="#3F5A6B" />
    </svg>
  );
}

export const CategoryIcon: Record<string, (p: IconProps) => JSX.Element> = {
  electronics: Icon.laptop,
  documents: Icon.doc,
  keys: Icon.key,
  clothing: Icon.shirt,
  accessories: Icon.bag,
  other: Icon.package,
};

export const CategoryTone: Record<string, string> = {
  electronics: "blue",
  documents: "sand",
  keys: "cream",
  clothing: "blue",
  accessories: "sand",
  other: "sage",
};

export const Tones: Record<string, [string, string]> = {
  blue: ["#E4EFF7", "#C8DBE8"],
  sage: ["#E2ECE6", "#C2D4CA"],
  sand: ["#EFE9DD", "#D9CFBC"],
  rose: ["#F1DDDD", "#D7BABA"],
  mauve: ["#E6DEEA", "#C8BCD2"],
  cream: ["#F2EBDB", "#DCD0B7"],
};

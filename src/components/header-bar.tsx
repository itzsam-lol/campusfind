"use client";

import Link from "next/link";
import { Icon } from "./icons";

export function HeaderBar({
  left,
  right,
  title,
  back,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title?: string;
  back?: string;
}) {
  return (
    <header className="h-13 flex items-center justify-between px-4 bg-white border-b border-[rgba(70,75,85,0.10)] sticky top-0 z-30" style={{ height: 52 }}>
      <div className="flex-1 flex items-center gap-2">
        {back ? (
          <Link href={back} className="w-8 h-8 flex items-center justify-center rounded-md">
            <Icon.back size={20} stroke="#566472" />
          </Link>
        ) : null}
        {left}
      </div>
      {title && <div className="text-base font-semibold text-cf-text">{title}</div>}
      <div className="flex-1 flex items-center justify-end gap-2">{right}</div>
    </header>
  );
}

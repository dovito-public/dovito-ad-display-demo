"use client";

import Link from "next/link";
import { resetDemo } from "@/lib/mock-store";

export function DemoBanner() {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-9 bg-yellow-400 text-black text-xs sm:text-sm px-4 text-center font-medium flex items-center justify-center gap-x-4 z-[60]"
    >
      <span>
        <strong>DEMO MODE</strong> — all data is mock and stored locally in your browser.
      </span>
      <button
        onClick={() => resetDemo()}
        className="underline hover:no-underline font-semibold"
      >
        Reset demo
      </button>
      <Link href="/audit" className="underline hover:no-underline font-semibold">
        View audit
      </Link>
    </div>
  );
}

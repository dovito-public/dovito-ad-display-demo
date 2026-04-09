"use client";

import Link from "next/link";
import { resetDemo } from "@/lib/mock-store";

export function DemoBanner() {
  return (
    <div
      className="w-full bg-yellow-400 text-black text-xs sm:text-sm py-2 px-4 text-center font-medium flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
      style={{ position: "relative", zIndex: 100 }}
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

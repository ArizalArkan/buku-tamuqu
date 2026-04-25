"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/guests": "Data Tamu",
  "/attendance": "Kehadiran",
  "/check-in": "Check-in",
  "/souvenir": "Souvenir",
  "/rsvp": "RSVP",
};

export default function Topbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const title = useMemo(() => titles[pathname] ?? "Dashboard", [pathname]);

  return (
    <header className="sticky top-0 z-20 h-14 border-b bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="mx-auto max-w-screen-2xl h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            className="md:hidden -ml-1 mr-1 inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Open menu"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("toggle-sidebar"));
              }
            }}
          >
            <Menu className="size-5" />
          </button>
          <h1 className="text-base md:text-lg font-semibold tracking-tight">{title}</h1>
          {/* <span className="text-xs rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 border border-amber-200">Demo Data</span> */}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setDark((d) => !d)}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <div className="size-8 rounded-full bg-slate-200" />
        </div>
      </div>
    </header>
  );
}

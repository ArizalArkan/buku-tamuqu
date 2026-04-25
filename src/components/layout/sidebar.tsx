"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, CalendarCheck2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/guests", label: "Data Tamu", icon: Users },
  { href: "/attendance", label: "Kehadiran", icon: CalendarCheck2 },
  { href: "/check-in", label: "Check-in", icon: QrCode },
  // { href: "/souvenir", label: "Souvenir", icon: Gift },
  // { href: "/rsvp", label: "RSVP", icon: FileSpreadsheet },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    if (typeof window !== "undefined") {
      window.addEventListener("toggle-sidebar", onToggle as any);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("toggle-sidebar", onToggle as any);
      }
    };
  }, []);

  useEffect(() => {
    // Close drawer on route change
    setOpen(false);
  }, [pathname]);

  const NavList = (
    <>
      <div className="h-14 flex items-center px-4 border-b">
        <span className="text-lg font-semibold tracking-tight">Buku Tamu</span>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-slate-200" />
          <div className="min-w-0">
            <div className="text-sm font-medium leading-5 text-slate-800">Usher</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-gray-200 bg-white/90 backdrop-blur supports-backdrop-filter:bg-white/70">
        {NavList}
      </aside>

      {/* Mobile drawer */}
      <div className={cn("md:hidden", open ? "fixed inset-0 z-40" : "pointer-events-none")}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/30 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />
        {/* Panel */}
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-64 bg-white shadow-lg border-r transition-transform",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
        >
          {NavList}
        </aside>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-cyan-400" />
          <h1 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            BACKEND FORWARD CONCEPT SITE
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            className={
              pathname === "/"
                ? "bg-cyan-500/10 text-cyan-400"
                : "text-slate-300 hover:text-cyan-400"
            }
          >
            <Link href="/">Services</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className={
              pathname === "/events"
                ? "bg-cyan-500/10 text-cyan-400"
                : "text-slate-300 hover:text-cyan-400"
            }
          >
            <Link href="/events" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Events
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

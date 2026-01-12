"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Activity, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleResetDemo = () => {
    // Clear all localStorage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    // Redirect to home with onboarding parameter
    router.push("/?onboarding=true");
    // Force a hard refresh to ensure clean state
    window.location.href = "/?onboarding=true";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {pathname === "/" ? (
          <div className="flex items-center gap-2 cursor-default">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Under Minis Onboarding Concept
            </h1>
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Under Minis Onboarding Concept
            </h1>
          </Link>
        )}
        <div className="flex items-center gap-2">
          {pathname === "/" ? (
            <Button
              variant="ghost"
              disabled
              className="bg-cyan-500/10 text-cyan-400 cursor-default"
            >
              Services
            </Button>
          ) : (
            <Button
              variant="ghost"
              asChild
              className="text-slate-300 hover:text-cyan-400"
            >
              <Link href="/">Services</Link>
            </Button>
          )}
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
              Logs
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleResetDemo}
            className="border-slate-700/50 hover:border-yellow-500/50 hover:bg-yellow-500/10 text-slate-300 hover:text-yellow-400"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Demo
          </Button>
        </div>
      </div>
    </nav>
  );
}

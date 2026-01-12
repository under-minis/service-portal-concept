"use client";

import { Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrialCreditsDisplayProps {
  credits: number;
  totalCredits?: number;
}

export function TrialCreditsDisplay({
  credits,
  totalCredits = 50,
}: TrialCreditsDisplayProps) {
  const percentage = (credits / totalCredits) * 100;
  const estimatedRuns = Math.floor(credits / 0.1); // Assuming $0.10 per run average

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
      <Gift className="h-4 w-4 text-yellow-400" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Trial Credits</span>
          <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30 text-xs">
            ${credits.toFixed(2)}
          </Badge>
        </div>
        <div className="w-32 h-1.5 bg-slate-700/50 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-slate-500 ml-2">
        ~{estimatedRuns} runs
      </span>
    </div>
  );
}


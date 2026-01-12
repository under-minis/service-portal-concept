"use client";

import { CheckCircle2 } from "lucide-react";

interface StepIndicatorProps {
  currentStep: 1 | 2;
  step1Complete: boolean;
  step2Complete: boolean;
}

export function StepIndicator({
  currentStep,
  step1Complete,
  step2Complete,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            currentStep >= 1 || step1Complete
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
              : "bg-slate-800 text-slate-500 border border-slate-700"
          }`}
        >
          {step1Complete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            "1"
          )}
        </div>
        <span
          className={`text-sm font-medium transition-colors ${
            currentStep >= 1 || step1Complete
              ? "text-cyan-400"
              : "text-slate-500"
          }`}
        >
          Developer
        </span>
      </div>
      <div
        className={`h-px flex-1 transition-all duration-300 ${
          currentStep >= 2 || step2Complete
            ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-green-500"
            : "bg-slate-700"
        }`}
      />
      <div className="flex items-center gap-2">
        <div
          className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            currentStep >= 2 || step2Complete
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50"
              : "bg-slate-800 text-slate-500 border border-slate-700"
          }`}
        >
          {step2Complete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            "2"
          )}
        </div>
        <span
          className={`text-sm font-medium transition-colors ${
            currentStep >= 2 || step2Complete
              ? "text-green-400"
              : "text-slate-500"
          }`}
        >
          Ops Team
        </span>
      </div>
    </div>
  );
}


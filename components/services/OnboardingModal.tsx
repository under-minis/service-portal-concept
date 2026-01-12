"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Clock, Gift } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetStarted: () => void;
}

export function OnboardingModal({
  open,
  onOpenChange,
  onGetStarted,
}: OnboardingModalProps) {
  const handleSkip = () => {
    localStorage.setItem("skipOnboarding", "true");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Sparkles className="h-10 w-10 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl" />
            </div>
            <DialogTitle className="text-3xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to Service Network
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-lg">
            Get started in under 30 minutes and see your first service in action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <h3 className="font-semibold text-slate-200">Quick Setup</h3>
              </div>
              <p className="text-sm text-slate-400">
                Create your first service and run examples in minutes
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold text-slate-200">Fast Results</h3>
              </div>
              <p className="text-sm text-slate-400">
                See value immediately with pre-configured examples
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-slate-200">Free Trial Credits</h3>
            </div>
            <p className="text-sm text-slate-400">
              Receive $50 in free trial credits to test everything (~500 test runs)
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h3 className="font-semibold text-slate-200 mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Complete welcome packet with developer guide and team resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>JSON examples for API integration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Test runner to see your service in action</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Clear next steps to production</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 border-slate-700/50 hover:border-slate-600 text-slate-300"
          >
            Skip for Now
          </Button>
          <Button
            onClick={onGetStarted}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25"
          >
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


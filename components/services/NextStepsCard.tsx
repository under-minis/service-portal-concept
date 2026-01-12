"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, Play, FileCode, Network, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NextStepsCardProps {
  emailAddress: string;
  onRunTest: () => void;
  onViewDetails: () => void;
  onSetupWebhooks?: () => void;
}

export function NextStepsCard({
  emailAddress,
  onRunTest,
  onViewDetails,
  onSetupWebhooks,
}: NextStepsCardProps) {
  return (
    <Card className="rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Check Email - Highlighted */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Mail className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-200">Check Your Email</h3>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  Important
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Your preview packet has been sent to{" "}
                <span className="text-cyan-400 font-mono">{emailAddress}</span>
              </p>
              <p className="text-xs text-slate-500">
                The email includes: HTML developer guide, request body JSON, webhook payload JSON, and email payload JSON
              </p>
            </div>
          </div>
        </div>

        {/* Other Steps */}
        <div className="space-y-3">
          <button
            onClick={onRunTest}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <Play className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                  Run Your First Test
                </h3>
                <p className="text-sm text-slate-400">
                  Execute a test run with example data
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={onViewDetails}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <FileCode className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                  View API Documentation
                </h3>
                <p className="text-sm text-slate-400">
                  See complete API integration details
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </button>

          {onSetupWebhooks && (
            <button
              onClick={onSetupWebhooks}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Network className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    Set Up Production Webhooks
                  </h3>
                  <p className="text-sm text-slate-400">
                    Configure webhooks for production use
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


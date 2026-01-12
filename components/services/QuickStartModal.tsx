"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Sparkles } from "lucide-react";
import { mockWorkflows } from "@/data/mockWorkflows";
import { formatCurrency } from "@/lib/utils/formatting";
import { calculateCostPerRun } from "@/lib/utils/costCalculation";

interface QuickStartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (serviceName: string) => void;
  isCreating?: boolean;
}

const DEFAULT_WORKFLOWS = ["wf-001", "wf-002"]; // Email Verification, Phone Verification

export function QuickStartModal({
  open,
  onOpenChange,
  onCreate,
  isCreating = false,
}: QuickStartModalProps) {
  const [serviceName, setServiceName] = useState("");

  const selectedWorkflows = DEFAULT_WORKFLOWS;
  const calculatedCost = calculateCostPerRun(selectedWorkflows.length);
  const workflowNames = mockWorkflows
    .filter((wf) => selectedWorkflows.includes(wf.id))
    .map((wf) => wf.name);

  const handleCreate = () => {
    if (!serviceName.trim()) {
      return;
    }

    onCreate(serviceName.trim());
  };

  const handleClose = (open: boolean) => {
    if (!isCreating) {
      if (!open) {
        setServiceName("");
      }
      onOpenChange(open);
    }
  };

  const isFormValid = serviceName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(open) => handleClose(open)}>
      <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-cyan-400" />
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Quick Start
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Create your first service in minutes. We&apos;ll send you a complete
            welcome packet with everything you need.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="service-name" className="text-slate-300">
              Service Name
            </Label>
            <Input
              id="service-name"
              placeholder="My First Service"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
              disabled={isCreating}
            />
            <p className="text-xs text-slate-500">
              Choose a name to identify this service
            </p>
          </div>

          {/* Pre-selected Workflows */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <Label className="text-slate-300">Selected Workflows</Label>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="flex flex-wrap gap-2 mb-3">
                {workflowNames.map((name) => (
                  <Badge
                    key={name}
                    className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                These workflows are pre-selected for quick start. You can add
                more later.
              </p>
            </div>
          </div>

          {/* Cost Estimate */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">
                  Estimated Cost per Run
                </p>
                <p className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {formatCurrency(calculatedCost)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Workflows</p>
                <p className="text-lg font-semibold text-cyan-400">
                  {selectedWorkflows.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isCreating}
            className="border-slate-700/50 hover:border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isFormValid || isCreating}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            {isCreating ? (
              <>Creating...</>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

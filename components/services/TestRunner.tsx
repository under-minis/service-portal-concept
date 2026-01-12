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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, CheckCircle2, XCircle, Loader2, Eye } from "lucide-react";
import type { Service } from "@/types/service";
import { generateRequestBody } from "@/lib/services/requestBodyGenerator";

interface TestRunnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  onViewDetails?: () => void;
}

type TestStatus = "idle" | "running" | "success" | "error";

export function TestRunner({
  open,
  onOpenChange,
  service,
  onViewDetails,
}: TestRunnerProps) {
  const [testData, setTestData] = useState<Record<string, unknown>>(() => {
    const defaultBody = generateRequestBody(service.workflowNames);
    return defaultBody;
  });
  const [status, setStatus] = useState<TestStatus>("idle");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleRunTest = async () => {
    setStatus("running");
    setResult(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock success response
    const mockResult = {
      serviceId: service.id,
      requestId: `req-${Date.now()}`,
      recordId: testData.recordId || `rec-${Date.now()}`,
      status: "completed",
      timestamp: new Date().toISOString(),
      workflows: service.workflowNames,
      results: {
        success: true,
        message: "All workflows completed successfully",
      },
    };

    setResult(mockResult);
    setStatus("success");
  };

  const handleFieldChange = (field: string, value: string) => {
    setTestData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetTest = () => {
    setStatus("idle");
    setResult(null);
    const defaultBody = generateRequestBody(service.workflowNames);
    setTestData(defaultBody);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
            <Play className="h-6 w-6" />
            Test Runner - {service.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Run a test execution with example data to see your service in action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Data Input */}
          {status === "idle" && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-3 block">Test Data</Label>
                <div className="space-y-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  {Object.entries(testData).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs text-slate-400 uppercase tracking-wider">
                        {key}
                      </Label>
                      <Input
                        value={String(value || "")}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 text-slate-100 font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Running State */}
          {status === "running" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
              <p className="text-slate-400">Processing your test request...</p>
              <p className="text-sm text-slate-500 mt-2">
                This may take a few seconds
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <div>
                  <h3 className="font-semibold text-green-400">Test Completed Successfully</h3>
                  <p className="text-sm text-slate-400">
                    All workflows executed successfully
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Test Results</Label>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-700/50">
                  <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                    <code>{JSON.stringify(result, null, 2)}</code>
                  </pre>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-2">
                  <strong className="text-slate-300">What happened:</strong>
                </p>
                <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                  <li>Service processed your test data</li>
                  <li>All workflows executed successfully</li>
                  <li>Results are ready for review</li>
                  {service.emailDestinations && service.emailDestinations.length > 0 && (
                    <li>Email sent to configured destinations</li>
                  )}
                  {service.webhookConnections && service.webhookConnections.length > 0 && (
                    <li>Webhook payloads sent to configured endpoints</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-red-400 mb-4" />
              <p className="text-slate-400">Test execution failed</p>
              <p className="text-sm text-slate-500 mt-2">
                Please check your service configuration
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {status === "idle" && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-700/50 hover:border-slate-600 text-slate-300"
              >
                Close
              </Button>
              <Button
                onClick={handleRunTest}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
            </>
          )}

          {status === "success" && (
            <>
              <Button
                variant="outline"
                onClick={resetTest}
                className="border-slate-700/50 hover:border-slate-600 text-slate-300"
              >
                Run Another Test
              </Button>
              {onViewDetails && (
                <Button
                  variant="outline"
                  onClick={onViewDetails}
                  className="border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Service Details
                </Button>
              )}
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0"
              >
                Done
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <Button
                variant="outline"
                onClick={resetTest}
                className="border-slate-700/50 hover:border-slate-600 text-slate-300"
              >
                Try Again
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0"
              >
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


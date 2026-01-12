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
import { FileCode, Mail, CheckCircle2, Download } from "lucide-react";
import type { PreviewPacket } from "@/lib/utils/previewPacketGenerator";

interface PreviewPacketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailAddress: string;
  previewPacket: PreviewPacket | null;
  onSend: () => Promise<void>;
  isSending?: boolean;
}

export function PreviewPacketModal({
  open,
  onOpenChange,
  emailAddress,
  previewPacket,
  onSend,
  isSending = false,
}: PreviewPacketModalProps) {
  const [activeTab, setActiveTab] = useState<"html" | "request" | "webhook" | "email">("html");

  const handleDownload = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!previewPacket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Preview Packet Ready
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Review the contents before sending to <span className="text-cyan-400">{emailAddress}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab("html")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "html"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <FileCode className="h-4 w-4 inline mr-2" />
              HTML Report
            </button>
            <button
              onClick={() => setActiveTab("request")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "request"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Request Body
            </button>
            <button
              onClick={() => setActiveTab("webhook")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "webhook"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Webhook Payload
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "email"
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Email Payload
            </button>
          </div>

          {/* Content */}
          <div className="border border-slate-700/50 rounded-lg bg-slate-950 p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
            {activeTab === "html" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">
                      Developer HTML Report
                    </h3>
                    <p className="text-sm text-slate-400">
                      Complete service documentation with all integration details
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        previewPacket.html,
                        "service-guide.html",
                        "text/html"
                      )
                    }
                    className="border-slate-700/50 hover:border-cyan-500/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="border border-slate-700/50 rounded p-4 bg-slate-900/50">
                  <iframe
                    srcDoc={previewPacket.html}
                    className="w-full h-[400px] border-0 rounded"
                    title="HTML Preview"
                  />
                </div>
              </div>
            )}

            {activeTab === "request" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">
                      Request Body JSON
                    </h3>
                    <p className="text-sm text-slate-400">
                      What to send to the API endpoint
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        previewPacket.requestBodyJson,
                        "request-body.json",
                        "application/json"
                      )
                    }
                    className="border-slate-700/50 hover:border-cyan-500/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                  <code>{previewPacket.requestBodyJson}</code>
                </pre>
              </div>
            )}

            {activeTab === "webhook" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">
                      Webhook Payload JSON
                    </h3>
                    <p className="text-sm text-slate-400">
                      What webhooks will receive
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        previewPacket.webhookPayloadJson,
                        "webhook-payload.json",
                        "application/json"
                      )
                    }
                    className="border-slate-700/50 hover:border-cyan-500/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                  <code>{previewPacket.webhookPayloadJson}</code>
                </pre>
              </div>
            )}

            {activeTab === "email" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">
                      Email Payload JSON
                    </h3>
                    <p className="text-sm text-slate-400">
                      What email destinations will receive
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        previewPacket.emailPayloadJson,
                        "email-payload.json",
                        "application/json"
                      )
                    }
                    className="border-slate-700/50 hover:border-cyan-500/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                  <code>{previewPacket.emailPayloadJson}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-slate-200">Package Contents</h3>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                HTML Report
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                request-body.json
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                webhook-payload.json
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                email-payload.json
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-3">
              All files will be sent to <span className="text-cyan-400 font-mono">{emailAddress}</span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700/50 hover:border-slate-600 text-slate-300"
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={onSend}
            disabled={isSending}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Preview Packet to {emailAddress}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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
import { FileCode, Mail, CheckCircle2, Download, Users, Code, CheckCircle, XCircle } from "lucide-react";
import type { WelcomePacket } from "@/lib/utils/welcomePacketGenerator";

interface PreviewPacketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailAddress: string;
  previewPacket: WelcomePacket | null;
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
  const [activeView, setActiveView] = useState<"developer" | "ops">("developer");
  const [activeTab, setActiveTab] = useState<string>("guide");

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

  const developerTabs = [
    { id: "guide", label: "Developer Guide", icon: FileCode, content: previewPacket.developerGuideHtml, filename: "developer-guide.html", type: "html" },
    { id: "request", label: "Request Body", icon: Code, content: previewPacket.requestBodyJson, filename: "request-body.json", type: "json" },
    { id: "webhook", label: "Webhook Payload", icon: Code, content: previewPacket.webhookPayloadJson, filename: "webhook-payload.json", type: "json" },
    { id: "email", label: "Email Payload", icon: Code, content: previewPacket.emailPayloadJson, filename: "email-payload.json", type: "json" },
    { id: "success", label: "Success Example", icon: CheckCircle, content: previewPacket.successExampleJson, filename: "success-example.json", type: "json" },
    { id: "failure", label: "Failure Example", icon: XCircle, content: previewPacket.failureExampleJson, filename: "failure-example.json", type: "json" },
  ];

  const opsTabs = [
    { id: "welcome", label: "Welcome Guide", icon: Users, content: previewPacket.opsWelcomeGuideHtml, filename: "welcome-guide.html", type: "html" },
    { id: "checklist", label: "Quick Start Checklist", icon: CheckCircle2, content: previewPacket.quickStartChecklistHtml, filename: "quick-start-checklist.html", type: "html" },
  ];

  const currentTabs = activeView === "developer" ? developerTabs : opsTabs;
  const currentTab = currentTabs.find(t => t.id === activeTab) || currentTabs[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Welcome Packet Ready
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Review the contents before sending to <span className="text-cyan-400">{emailAddress}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* View Toggle */}
          <div className="flex gap-2 p-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <button
              onClick={() => {
                setActiveView("developer");
                setActiveTab("guide");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeView === "developer"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Code className="h-4 w-4" />
              Developer Files
            </button>
            <button
              onClick={() => {
                setActiveView("ops");
                setActiveTab("welcome");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeView === "ops"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Users className="h-4 w-4" />
              Ops Team Files
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-700/50 overflow-x-auto">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="border border-slate-700/50 rounded-lg bg-slate-950 p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
            {currentTab.type === "html" ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">
                      {currentTab.label}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {activeView === "developer" 
                        ? "Complete technical documentation with all integration details"
                        : "Non-technical guide for your team"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        currentTab.content,
                        currentTab.filename,
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
                    srcDoc={currentTab.content}
                    className="w-full h-[400px] border-0 rounded"
                    title={currentTab.label}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">
                      {currentTab.label}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {currentTab.id === "success" 
                        ? "Complete success scenario with request and response"
                        : currentTab.id === "failure"
                        ? "Failure scenario with error handling and fixes"
                        : `JSON structure for ${currentTab.label.toLowerCase()}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        currentTab.content,
                        currentTab.filename,
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
                  <code>{currentTab.content}</code>
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
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Developer Files (6)
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                    developer-guide.html
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                    request-body.json
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                    webhook-payload.json
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                    email-payload.json
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                    success-example.json
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                    failure-example.json
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ops Team Files (2)
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    welcome-guide.html
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    quick-start-checklist.html
                  </Badge>
                </div>
              </div>
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
                Send Welcome Packet to {emailAddress}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

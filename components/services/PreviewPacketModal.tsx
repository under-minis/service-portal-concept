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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  CheckCircle2,
  ChevronLeft,
  FileCode,
  Code,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import type { WelcomePacket } from "@/lib/utils/welcomePacketGenerator";
import { FilePreview } from "./FilePreview";
import { StepIndicator } from "./StepIndicator";
import { TabNavigation } from "./TabNavigation";
import { PackageSummary } from "./PackageSummary";

interface PreviewPacketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail: string;
  previewPacket: WelcomePacket | null;
  onSendDeveloper: (email: string) => Promise<void>;
  onSendOps: (email: string) => Promise<void>;
  isSending?: boolean;
}

export function PreviewPacketModal({
  open,
  onOpenChange,
  initialEmail,
  previewPacket,
  onSendDeveloper,
  onSendOps,
  isSending = false,
}: PreviewPacketModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [developerEmail, setDeveloperEmail] = useState(initialEmail);
  const [opsEmail, setOpsEmail] = useState(initialEmail);
  const [useSameEmail, setUseSameEmail] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("guide");
  const [developerSent, setDeveloperSent] = useState(false);
  const [opsSent, setOpsSent] = useState(false);

  const handleDownload = (
    content: string,
    filename: string,
    contentType: string
  ) => {
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendDeveloper = async () => {
    if (!validateEmail(developerEmail)) {
      alert("Please enter a valid email address");
      return;
    }
    await onSendDeveloper(developerEmail);
    setDeveloperSent(true);
    setStep(2);
  };

  const handleSendOps = async () => {
    const emailToUse = useSameEmail ? developerEmail : opsEmail;
    if (!validateEmail(emailToUse)) {
      alert("Please enter a valid email address");
      return;
    }
    await onSendOps(emailToUse);
    setOpsSent(true);
    onOpenChange(false);
  };

  const handleUseSameEmailChange = (checked: boolean) => {
    setUseSameEmail(checked);
    if (checked) {
      setOpsEmail(developerEmail);
    }
  };

  if (!previewPacket) return null;

  const developerTabs = [
    {
      id: "guide",
      label: "Guide",
      icon: FileCode,
      content: previewPacket.developerGuideHtml,
      filename: "developer-guide.html",
      type: "html" as const,
      description: "Complete technical documentation",
    },
    {
      id: "request",
      label: "Request",
      icon: Code,
      content: previewPacket.requestBodyJson,
      filename: "request-body.json",
      type: "json" as const,
      description: "API request template",
    },
    {
      id: "webhook",
      label: "Webhook",
      icon: Code,
      content: previewPacket.webhookPayloadJson,
      filename: "webhook-payload.json",
      type: "json" as const,
      description: "Webhook payload structure",
    },
    {
      id: "email",
      label: "Email",
      icon: Code,
      content: previewPacket.emailPayloadJson,
      filename: "email-payload.json",
      type: "json" as const,
      description: "Email payload structure",
    },
    {
      id: "success",
      label: "Success",
      icon: CheckCircle,
      content: previewPacket.successExampleJson,
      filename: "success-example.json",
      type: "json" as const,
      description: "Complete success scenario",
    },
    {
      id: "failure",
      label: "Failure",
      icon: XCircle,
      content: previewPacket.failureExampleJson,
      filename: "failure-example.json",
      type: "json" as const,
      description: "Failure scenario with fixes",
    },
  ];

  const opsTabs = [
    {
      id: "welcome",
      label: "Welcome",
      icon: Users,
      content: previewPacket.opsWelcomeGuideHtml,
      filename: "welcome-guide.html",
      type: "html" as const,
      description: "Non-technical guide for your team",
    },
    {
      id: "checklist",
      label: "Checklist",
      icon: CheckCircle2,
      content: previewPacket.quickStartChecklistHtml,
      filename: "quick-start-checklist.html",
      type: "html" as const,
      description: "Step-by-step checklist",
    },
  ];

  const currentTabs = step === 1 ? developerTabs : opsTabs;
  const currentTab =
    currentTabs.find((t) => t.id === activeTab) || currentTabs[0];

  const developerFiles = [
    "developer-guide.html",
    "request-body.json",
    "webhook-payload.json",
    "email-payload.json",
    "success-example.json",
    "failure-example.json",
  ];

  const opsFiles = ["welcome-guide.html", "quick-start-checklist.html"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border-slate-700/50 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700/50">
          <StepIndicator
            currentStep={step}
            step1Complete={developerSent}
            step2Complete={opsSent}
          />
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 px-6 pb-4 overflow-hidden">
          {/* Step 1: Developer Packet */}
          {step === 1 && (
            <div className="flex flex-col h-full space-y-4">
              {/* Tab Navigation */}
              <TabNavigation
                tabs={developerTabs.map((t) => ({
                  id: t.id,
                  label: t.label,
                  icon: t.icon,
                }))}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="developer"
              />

              {/* File Preview */}
              <div className="flex-1 min-h-0">
                <FilePreview
                  title={currentTab.label}
                  description={currentTab.description}
                  content={currentTab.content}
                  filename={currentTab.filename}
                  type={currentTab.type}
                  onDownload={handleDownload}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="developer-email"
                  className="text-sm text-slate-300 flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  Developer Email Address{" "}
                  <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="developer-email"
                  type="email"
                  placeholder="developer@example.com"
                  value={developerEmail}
                  onChange={(e) => setDeveloperEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                  disabled={isSending || developerSent}
                />
                <p className="text-xs text-slate-500">
                  Send developer guide (6 files) to this address
                </p>
              </div>

              {/* Package Summary */}
              <PackageSummary
                type="developer"
                files={developerFiles}
                email={developerEmail}
              />
            </div>
          )}

          {/* Step 2: Ops Packet */}
          {step === 2 && (
            <div className="flex flex-col h-full space-y-4">
              {/* Tab Navigation */}
              <TabNavigation
                tabs={opsTabs.map((t) => ({
                  id: t.id,
                  label: t.label,
                  icon: t.icon,
                }))}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="ops"
              />

              {/* File Preview */}
              <div className="flex-1 min-h-0">
                <FilePreview
                  title={currentTab.label}
                  description={currentTab.description}
                  content={currentTab.content}
                  filename={currentTab.filename}
                  type={currentTab.type}
                  onDownload={handleDownload}
                />
              </div>

              {/* Email Input */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <Checkbox
                    id="use-same-email"
                    checked={useSameEmail}
                    onCheckedChange={handleUseSameEmailChange}
                    className="border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    disabled={isSending || opsSent}
                  />
                  <Label
                    htmlFor="use-same-email"
                    className="text-sm font-medium text-slate-300 cursor-pointer flex-1"
                  >
                    Use same email as developer (
                    <span className="font-mono text-xs">{developerEmail}</span>)
                  </Label>
                </div>

                {!useSameEmail && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="ops-email"
                      className="text-sm text-slate-300 flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Ops Team Email Address{" "}
                      <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="ops-email"
                      type="email"
                      placeholder="ops@example.com"
                      value={opsEmail}
                      onChange={(e) => setOpsEmail(e.target.value)}
                      className="bg-slate-800/50 border-slate-700/50 focus:border-green-500/50 focus:ring-green-500/20 text-slate-100"
                      disabled={isSending || opsSent}
                    />
                    <p className="text-xs text-slate-500">
                      Send welcome guide (2 files) to this address
                    </p>
                  </div>
                )}
              </div>

              {/* Package Summary */}
              <PackageSummary
                type="ops"
                files={opsFiles}
                email={useSameEmail ? developerEmail : opsEmail}
              />
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-700/50 gap-2">
          {step === 1 ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-700/50 hover:border-slate-600 text-slate-300"
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendDeveloper}
                disabled={
                  isSending || !validateEmail(developerEmail) || developerSent
                }
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                {isSending ? (
                  <>Sending...</>
                ) : developerSent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Sent! Continue
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Developer Packet
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-slate-700/50 hover:border-slate-600 text-slate-300"
                disabled={isSending}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSendOps}
                disabled={
                  isSending ||
                  !validateEmail(useSameEmail ? developerEmail : opsEmail) ||
                  opsSent
                }
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white border-0 shadow-lg shadow-green-500/25 disabled:opacity-50"
              >
                {isSending ? (
                  <>Sending...</>
                ) : opsSent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete!
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Ops Team Packet
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

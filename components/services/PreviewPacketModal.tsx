"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, FileCode } from "lucide-react";
import type { WelcomePacket } from "@/lib/utils/welcomePacketGenerator";
import { FilePreview } from "./FilePreview";

interface PreviewPacketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail: string;
  previewPacket: WelcomePacket | null;
  onSendGuide: (email: string) => Promise<void>;
  isSending?: boolean;
}

export function PreviewPacketModal({
  open,
  onOpenChange,
  initialEmail,
  previewPacket,
  onSendGuide,
  isSending = false,
}: PreviewPacketModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [guideSent, setGuideSent] = useState(false);

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

  const handleSendGuide = async () => {
    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }
    await onSendGuide(email);
    setGuideSent(true);
    onOpenChange(false);
  };

  if (!previewPacket) return null;

  const guideTab = {
    id: "guide",
    label: "Guide",
    icon: FileCode,
    content: previewPacket.developerGuideHtml,
    filename: "guide.html",
    type: "html" as const,
    description: "Complete guide for working with basic email and mini forms",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border-slate-700/50 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700/50">
          <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Guide Preview
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 px-6 pb-4 overflow-hidden">
          <div className="flex flex-col h-full space-y-4">
            {/* File Preview */}
            <div className="flex-1 min-h-0">
              <FilePreview
                title={guideTab.label}
                description={guideTab.description}
                content={guideTab.content}
                filename={guideTab.filename}
                type={guideTab.type}
                onDownload={handleDownload}
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm text-slate-300 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-slate-100"
                disabled={isSending || guideSent}
              />
              <p className="text-xs text-slate-500">
                Send guide to this address
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-700/50 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700/50 hover:border-slate-600 text-slate-300"
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendGuide}
            disabled={isSending || !validateEmail(email) || guideSent}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            {isSending ? (
              <>Sending...</>
            ) : guideSent ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Sent!
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Guide
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

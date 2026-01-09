"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";

interface CopyButtonProps {
  text: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  label?: string;
}

export function CopyButton({
  text,
  variant = "outline",
  size = "sm",
  className,
  showText = false,
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayLabel = label || "Copy";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {showText && <span className="ml-2">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {showText && <span className="ml-2">{displayLabel}</span>}
        </>
      )}
    </Button>
  );
}


"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface FilePreviewProps {
  title: string;
  description: string;
  content: string;
  filename: string;
  type: "html" | "json";
  onDownload: (content: string, filename: string, contentType: string) => void;
}

export function FilePreview({
  title,
  description,
  content,
  filename,
  type,
  onDownload,
}: FilePreviewProps) {
  if (type === "html") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/50">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-200 mb-1 truncate">
              {title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(content, filename, "text/html")}
            className="ml-3 shrink-0 border-slate-700/50 hover:border-cyan-500/50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
        </div>
        <div className="flex-1 border border-slate-700/50 rounded-lg bg-slate-900/50 overflow-hidden">
          <iframe
            srcDoc={content}
            className="w-full h-full min-h-[350px] border-0"
            title={title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/50">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-200 mb-1 truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(content, filename, "application/json")}
          className="ml-3 shrink-0 border-slate-700/50 hover:border-cyan-500/50"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Download
        </Button>
      </div>
      <div className="flex-1 border border-slate-700/50 rounded-lg bg-slate-950 p-4 overflow-auto">
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}


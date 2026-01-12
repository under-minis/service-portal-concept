"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Code, Users } from "lucide-react";

interface PackageSummaryProps {
  type: "developer" | "ops";
  files: string[];
  email: string;
}

export function PackageSummary({
  type,
  files,
  email,
}: PackageSummaryProps) {
  const isDeveloper = type === "developer";
  const colorClasses = isDeveloper
    ? "from-cyan-500/10 to-blue-500/10 border-cyan-500/20"
    : "from-green-500/10 to-emerald-500/10 border-green-500/20";
  const iconColor = isDeveloper ? "text-cyan-400" : "text-green-400";
  const badgeColor = isDeveloper
    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
    : "bg-green-500/20 text-green-300 border-green-500/30";
  const emailColor = isDeveloper ? "text-cyan-400" : "text-green-400";
  const Icon = isDeveloper ? Code : Users;

  return (
    <div
      className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses} border`}
    >
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className={`h-4 w-4 ${iconColor}`} />
        <h3 className="text-sm font-semibold text-slate-200">
          {isDeveloper ? "Developer" : "Ops Team"} Package ({files.length}{" "}
          {files.length === 1 ? "file" : "files"})
        </h3>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {files.map((file) => (
          <Badge
            key={file}
            className={`${badgeColor} text-xs px-2 py-0.5`}
          >
            {file}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Will be sent to{" "}
        <span className={`${emailColor} font-mono`}>{email}</span>
      </p>
    </div>
  );
}


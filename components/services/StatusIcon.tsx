"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { ServiceEvent } from "@/types/service";

interface StatusIconProps {
  status: ServiceEvent["status"];
  className?: string;
}

export function StatusIcon({ status, className = "h-4 w-4" }: StatusIconProps) {
  switch (status) {
    case "completed":
      return <CheckCircle className={`${className} text-green-500`} />;
    case "failed":
      return <XCircle className={`${className} text-red-500`} />;
    case "pending":
      return <Clock className={`${className} text-yellow-500`} />;
  }
}


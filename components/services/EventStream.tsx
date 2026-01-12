"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EventType = "info" | "success" | "error" | "warning" | "progress";

export interface Event {
  id: string;
  timestamp: Date;
  type: EventType;
  message: string;
  details?: string;
  data?: Record<string, unknown>;
}

interface EventStreamProps {
  events: Event[];
  className?: string;
}

export function EventStream({ events, className }: EventStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "warning":
        return <XCircle className="h-4 w-4 text-yellow-400" />;
      case "progress":
        return <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "success":
        return "border-green-500/30 bg-green-500/5";
      case "error":
        return "border-red-500/30 bg-red-500/5";
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/5";
      case "progress":
        return "border-cyan-500/30 bg-cyan-500/5";
      default:
        return "border-blue-500/30 bg-blue-500/5";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <Card
      className={cn(
        "rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50",
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-cyan-400" />
          Team Activity
          <Badge className="ml-auto bg-slate-700/50 text-slate-300 border-slate-600">
            {events.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={scrollRef}
          className="h-[400px] overflow-y-auto space-y-2 p-4 font-mono text-xs"
        >
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No events yet. Start creating a service to see activity.</p>
              </div>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  getEventColor(event.type)
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400 font-mono text-[10px]">
                        {formatTime(event.timestamp)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          event.type === "success" &&
                            "border-green-500/50 text-green-400",
                          event.type === "error" &&
                            "border-red-500/50 text-red-400",
                          event.type === "warning" &&
                            "border-yellow-500/50 text-yellow-400",
                          event.type === "progress" &&
                            "border-cyan-500/50 text-cyan-400",
                          event.type === "info" &&
                            "border-blue-500/50 text-blue-400"
                        )}
                      >
                        {event.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-slate-200 text-xs leading-relaxed">
                      {event.message}
                    </p>
                    {event.details && (
                      <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                        {event.details}
                      </p>
                    )}
                    {event.data && Object.keys(event.data).length > 0 && (
                      <pre className="text-[10px] text-slate-500 mt-2 p-2 rounded bg-slate-900/50 overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

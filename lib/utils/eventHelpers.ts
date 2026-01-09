import type { ServiceEvent } from "@/types/service";

/**
 * Get the badge variant for an event type
 */
export function getTypeBadgeVariant(type: ServiceEvent["type"]) {
  switch (type) {
    case "error":
      return "destructive" as const;
    case "success":
      return "default" as const;
    case "destination":
      return "secondary" as const;
    case "report":
      return "outline" as const;
  }
}


import { Badge } from "@/components/ui/badge";

interface WorkflowBadgesProps {
  workflows: string[];
  variant?: "default" | "secondary" | "outline";
}

export function WorkflowBadges({
  workflows,
  variant = "secondary",
}: WorkflowBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {workflows.map((workflow, index) => (
        <Badge key={index} variant={variant}>
          {workflow}
        </Badge>
      ))}
    </div>
  );
}


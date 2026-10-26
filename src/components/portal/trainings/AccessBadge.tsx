import { Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AccessBadge({ unlocked, className }: { unlocked: boolean; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium",
        unlocked
          ? "border-success/40 bg-success/15 text-success"
          : "border-warning/40 bg-warning/15 text-warning-foreground",
        className
      )}
    >
      {unlocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
      {unlocked ? "Accès débloqué" : "Accès verrouillé"}
    </Badge>
  );
}
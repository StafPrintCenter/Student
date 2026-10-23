import { MapPin, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sessionModalityLabels, sessionResponseMap, type SessionModality, type SessionResponse } from "@/data/sessions";

export function SessionModalityBadge({ modality }: { modality: SessionModality }) {
  const online = modality === "online";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-[10px]",
        online ? "border-info/40 bg-info/15 text-info" : "border-primary/40 bg-primary/10 text-primary"
      )}
    >
      {online ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
      {sessionModalityLabels[modality] ?? modality}
    </Badge>
  );
}

export function SessionResponseBadge({
  response,
  isUpcoming,
}: {
  response: SessionResponse | null;
  isUpcoming: boolean;
}) {
  if (response) {
    const config = sessionResponseMap[response] ?? {
      label: response,
      className: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={cn("font-medium", config.className)}>
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        isUpcoming
          ? "border-warning/40 bg-warning/15 text-warning-foreground"
          : "border-border bg-muted text-muted-foreground"
      )}
    >
      {isUpcoming ? "À confirmer" : "Sans réponse"}
    </Badge>
  );
}
import { EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fullDate } from "@/components/portal/community/community-format";

interface HiddenPostAlertProps {
  reason: string | null;
  hiddenAt: string | null;
}

export function HiddenPostAlert({ reason, hiddenAt }: HiddenPostAlertProps) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="flex items-start gap-3 p-4 text-sm">
        <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="space-y-1">
          <p className="font-medium">Cette publication est masquée par la modération</p>
          {reason && <p className="text-xs text-muted-foreground">Motif : {reason}</p>}
          {hiddenAt && <p className="text-xs text-muted-foreground">Masquée le {fullDate(hiddenAt)}</p>}
          <p className="text-xs text-muted-foreground">Elle ne peut plus être modifiée tant qu'elle est masquée.</p>
        </div>
      </CardContent>
    </Card>
  );
}
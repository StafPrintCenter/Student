import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LockedAccessAlert({ minRatioPercent }: { minRatioPercent: number }) {
  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="flex items-start gap-4 p-4 text-sm text-warning-foreground">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="space-y-1">
          <p className="font-semibold">Accès au contenu restreint</p>
          <p className="text-xs opacity-90">
            Pour débloquer l'accès complet aux leçons et vidéos, vous devez régler le montant minimum d'acompte requis (
            {minRatioPercent}% du total).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
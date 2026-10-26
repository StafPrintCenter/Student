import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { isPayableEnrollment } from "./Utils";
import { formatFCFA } from "@/lib/format";
import { usePaymentsSummary } from "@/stores/usePaymentsStore";

const MAX_TRAININGS = 3;

export function PaymentsOverviewCard() {
  const { summary, items, isLoading, isError } = usePaymentsSummary();

  // Formations avec le plus gros solde en premier
  const withBalance = items
    .filter((i) => i.remaining > 0 && isPayableEnrollment(i.enrollmentStatus))
    .sort((a, b) => b.remaining - a.remaining)
    .slice(0, MAX_TRAININGS);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Règlements</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/payments">Détail</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError || !summary ? (
          <p className="text-sm text-destructive">Impossible de charger vos règlements.</p>
        ) : summary.totalDue === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun règlement à effectuer pour le moment.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Réglé</p>
                <p className="truncate text-sm font-semibold tabular-nums text-success">{formatFCFA(summary.totalPaid)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Reste à payer</p>
                <p className="truncate text-sm font-semibold tabular-nums text-warning">
                  {formatFCFA(summary.totalRemaining)}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatFCFA(summary.totalDue)} au total</span>
                <span className="tabular-nums">{summary.paidPercent}%</span>
              </div>
              <Progress value={summary.paidPercent} className="h-2" />
            </div>

            {withBalance.length > 0 && (
              <ul className="space-y-2.5 border-t pt-3">
                {withBalance.map((t) => (
                  <li key={t.enrollmentId} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="truncate">{t.trainingTitle}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        reste {formatFCFA(t.remaining)}
                      </span>
                    </div>
                    <Progress value={t.paidPercent} className="h-1" />
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-muted-foreground">
              {summary.lastPaymentAt
                ? `Dernier paiement le ${format(new Date(summary.lastPaymentAt), "d MMM yyyy", { locale: fr })}`
                : "Aucun paiement enregistré"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
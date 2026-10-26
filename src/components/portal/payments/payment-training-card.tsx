import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AccessBadge } from "@/components/shared/AccessBadge";
import { PaymentsDialog } from "@/components/portal/trainings/payments-dialog";
import { StatusBadge } from "@/components/portal/trainings/status-badge";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/format";
import { trainingEnrollmentStatusMap, trainingPaymentStatusMap } from "@/data/trainings";
import type { APITrainingPaymentItem } from "@/data/payments";

export function PaymentTrainingCard({ item }: { item: APITrainingPaymentItem }) {
  const [detailOpen, setDetailOpen] = useState(false);

  const missingForAccess = Math.max(0, item.accessMinAmount - item.totalPaid);
  // Position du seuil d'accès sur la barre de règlement
  const thresholdPercent = item.totalDue > 0 ? Math.min(100, (item.accessMinAmount / item.totalDue) * 100) : 0;

  return (
    <>
      <Card className="overflow-hidden border-3" style={{ borderTopColor: item.coverColor || "var(--border)" }}>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-2">
            <Link
              to="/trainings/$id/mine"
              params={{ id: item.trainingId }}
              className="min-w-0 truncate font-medium hover:underline"
            >
              {item.trainingTitle}
            </Link>
            <StatusBadge status={item.enrollmentStatus} map={trainingEnrollmentStatusMap} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Figure label="Total" value={formatFCFA(item.totalDue)} />
            <Figure label="Réglé" value={formatFCFA(item.totalPaid)} className="text-success" />
            <Figure label="Reste" value={formatFCFA(item.remaining)} className="text-warning" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Règlement</span>
              <span className="tabular-nums">{item.paidPercent}%</span>
            </div>
            <div className="relative">
              <Progress value={item.paidPercent} className="h-2" />
              {item.totalDue > 0 && (
                <span
                  aria-hidden
                  title="Seuil d'accès"
                  className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded bg-foreground/60"
                  style={{ left: `${thresholdPercent}%` }}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Seuil d'accès : <strong className="text-foreground">{formatFCFA(item.accessMinAmount)}</strong>
              {item.accessUnlocked
                ? " - atteint."
                : missingForAccess > 0
                  ? ` - il manque ${formatFCFA(missingForAccess)}.`
                  : "."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={item.paymentStatus} map={trainingPaymentStatusMap} />
              <AccessBadge unlocked={item.accessUnlocked} />
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={item.paymentsCount === 0}
              onClick={() => setDetailOpen(true)}
            >
              <Receipt className="mr-1.5 h-3.5 w-3.5" />
              {item.paymentsCount > 0
                ? `${item.paymentsCount} paiement${item.paymentsCount > 1 ? "s" : ""}`
                : "Aucun paiement"}
            </Button>
          </div>

          {item.lastPaymentAt && (
            <p className={cn("text-xs text-muted-foreground")}>
              Dernier paiement le {format(new Date(item.lastPaymentAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
          )}
        </CardContent>
      </Card>

      {detailOpen && <PaymentsDialog trainingId={item.trainingId} onClose={() => setDetailOpen(false)} />}
    </>
  );
}

function Figure({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("truncate text-sm font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}
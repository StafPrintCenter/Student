import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Banknote, CalendarCheck, Hourglass, Wallet } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/portal/progress/stat-card";
import { StatusBadge } from "@/components/portal/trainings/status-badge";
import { formatFCFA } from "@/lib/format";
import { trainingPaymentStatusMap, type TrainingPaymentStatus } from "@/data/trainings";
import type { APIPaymentsOverview } from "@/data/payments";

const STATUS_ORDER: TrainingPaymentStatus[] = ["unpaid", "partial", "paid"];

export function PaymentsOverview({ summary }: { summary: APIPaymentsOverview }) {
  const breakdown = STATUS_ORDER.filter((status) => (summary.byPaymentStatus[status] ?? 0) > 0);

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Banknote}
          label="Total dû"
          value={formatFCFA(summary.totalDue)}
          hint={`${summary.trainingsCount} formation${summary.trainingsCount > 1 ? "s" : ""}`}
        />
        <StatCard
          icon={Wallet}
          label="Déjà réglé"
          value={formatFCFA(summary.totalPaid)}
          hint={`${summary.paidPercent}% du total`}
        >
          <Progress value={summary.paidPercent} className="h-1.5" />
        </StatCard>
        <StatCard icon={Hourglass} label="Reste à payer" value={formatFCFA(summary.totalRemaining)} />
        <StatCard
          icon={CalendarCheck}
          label="Dernier paiement"
          value={summary.lastPaymentAt ? format(new Date(summary.lastPaymentAt), "d MMM yyyy", { locale: fr }) : "—"}
          hint={summary.lastPaymentAt ? `à ${format(new Date(summary.lastPaymentAt), "HH:mm")}` : "Aucun paiement enregistré"}
        />
      </div>

      {breakdown.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-xs text-muted-foreground">Répartition :</span>
          {breakdown.map((status) => (
            <span key={status} className="flex items-center gap-1.5">
              <StatusBadge status={status} map={trainingPaymentStatusMap} />
              <span className="text-xs tabular-nums text-muted-foreground">× {summary.byPaymentStatus[status]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
import { Progress } from "@/components/ui/progress";
import { AccessBadge } from "@/components/shared/AccessBadge";
import { StatusBadge } from "@/components/portal/trainings/status-badge";
import { formatFCFA } from "@/lib/format";
import { trainingPaymentStatusMap } from "@/data/trainings";
import type { APITrainingPaymentsSummary } from "@/data/payments";

export function PaymentsSummary({ summary }: { summary: APITrainingPaymentsSummary }) {
  const paidPercent =
    summary.totalAmount > 0 ? Math.min(100, Math.round((summary.amountPaid / summary.totalAmount) * 100)) : 0;
  const missingForAccess = Math.max(0, summary.accessMinAmount - summary.amountPaid);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={summary.paymentStatus} map={trainingPaymentStatusMap} />
        <AccessBadge unlocked={summary.accessUnlocked} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Figure label="Total" value={formatFCFA(summary.totalAmount)} />
        <Figure label="Réglé" value={formatFCFA(summary.amountPaid)} className="text-success" />
        <Figure label="Reste" value={formatFCFA(summary.remaining)} className="text-warning" />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Règlement</span>
          <span className="tabular-nums">{paidPercent}%</span>
        </div>
        <Progress value={paidPercent} className="h-2" />
      </div>

      <p className="text-xs text-muted-foreground">
        Seuil pour débloquer le contenu : <strong className="text-foreground">{formatFCFA(summary.accessMinAmount)}</strong>
        {summary.accessUnlocked
          ? " - atteint."
          : missingForAccess > 0
            ? ` - il vous manque ${formatFCFA(missingForAccess)}.`
            : "."}
      </p>
    </div>
  );
}

function Figure({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`truncate text-sm font-semibold tabular-nums ${className ?? ""}`}>{value}</p>
    </div>
  );
}
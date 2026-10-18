import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatFCFA } from "@/lib/format";
import { PAYMENTS_DISPLAY_LIMIT, paymentMethodLabels, type APITrainingPayment } from "@/data/payments";

interface PaymentListProps {
  payments: APITrainingPayment[];
  /** Nombre total de paiements de l'étudiant sur cette formation */
  totalCount: number;
}

export function PaymentList({ payments, totalCount }: PaymentListProps) {
  // Les paiements arrivent du plus récent au plus ancien : on garde les derniers
  const shown = payments.slice(0, PAYMENTS_DISPLAY_LIMIT);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Receipt className="h-4 w-4 text-primary" />
          {totalCount > shown.length ? `${shown.length} derniers paiements` : "Paiements"}
        </p>
        <span className="text-xs text-muted-foreground">
          {totalCount} au total
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          Aucun paiement enregistré pour cette formation.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border border-border">
          {shown.map((p) => (
            <li key={p.paymentId} className="space-y-1.5 px-3 py-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold tabular-nums">{formatFCFA(p.amount)}</span>
                <Badge variant="outline" className="text-[10px]">
                  {paymentMethodLabels[p.method] ?? p.method}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(p.date), "d MMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
              {p.reference && <p className="text-xs">Réf. : {p.reference}</p>}
              <p className="text-xs text-muted-foreground">
                Reste après ce paiement : <span className="tabular-nums">{formatFCFA(p.remaining)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
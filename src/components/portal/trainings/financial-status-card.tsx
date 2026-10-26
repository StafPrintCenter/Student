import { useState } from "react";
import { CreditCard, Percent, Receipt, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentsDialog } from "@/components/portal/trainings/payments-dialog";
import { StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/format";
import { trainingPaymentStatusMap, type APIStudentTrainingDetail, type APIStudentTrainingEnrollmentInfo } from "@/data/trainings";

interface FinancialStatusCardProps {
  training: APIStudentTrainingDetail;
  trainingId: string;
  enrollment: APIStudentTrainingEnrollmentInfo;
  accessMinRatioPercent: number;
}

export function FinancialStatusCard({ training, trainingId, enrollment, accessMinRatioPercent }: FinancialStatusCardProps) {
  const [paymentsOpen, setPaymentsOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" /> Statut Financier
          </CardTitle>
          <CardDescription className="text-xs">Détails du règlement et conditions d'accès</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Coût de la formation</span>
            <span className="font-medium">{formatFCFA(training.price)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Statut du paiement</span>
            <StatusBadge status={enrollment.paymentStatus} map={trainingPaymentStatusMap} />
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="h-4 w-4" /> Montant réglé
            </span>
            <span className="font-semibold text-primary">{formatFCFA(enrollment.amountPaid)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Percent className="h-4 w-4" /> Seuil d'accès requis
            </span>
            <span className="font-medium">{accessMinRatioPercent}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Accès aux cours</span>
            <span className={cn("font-medium", enrollment.accessUnlocked ? "text-success" : "text-warning")}>
              {enrollment.accessUnlocked ? "Débloqué" : "Verrouillé"}
            </span>
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={() => setPaymentsOpen(true)}>
            <Receipt className="mr-1.5 h-3.5 w-3.5" /> Détail des paiements
          </Button>
        </CardContent>
      </Card>

      {/* Monté à l'ouverture seulement : les paiements ne sont chargés qu'à ce moment-là */}
      {paymentsOpen && <PaymentsDialog trainingId={trainingId} onClose={() => setPaymentsOpen(false)} />}
    </>
  );
}
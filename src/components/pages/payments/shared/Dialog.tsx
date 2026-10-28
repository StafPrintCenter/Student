import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentList } from "@/components/pages/payments/shared/List";
import { PaymentsSummary } from "@/components/portal/trainings/payments-summary";
import { useTrainingPayments } from "@/stores/usePaymentsStore";

export function PaymentsDialog({ trainingId, onClose }: { trainingId: string; onClose: () => void }) {
  const { item, isLoading, isError, refetch } = useTrainingPayments(trainingId);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détail des paiements</DialogTitle>
          <DialogDescription>{item?.trainingTitle ?? "Règlements de cette formation"}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="text-destructive">Impossible de charger les paiements.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        ) : !item ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucun détail de paiement disponible.</p>
        ) : (
          <div className="space-y-5">
            <PaymentsSummary summary={item} />
            <PaymentList payments={item.payments} totalCount={item.paymentsCount} />
          </div>
        )}

        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";

import { PageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/portal/empty-state";
import { Button } from "@/components/ui/button";
import { PaymentTrainingCard } from "@/components/portal/payments/payment-training-card";
import { PaymentsOverview } from "@/components/portal/payments/payments-overview";
import { PaymentsSkeleton } from "@/components/portal/payments/payments-skeleton";
import { usePaymentsSummary } from "@/stores/usePaymentsStore";

export const Route = createFileRoute("/_student/payments/")({
  head: () => ({
    meta: [
      { title: "Mes paiements - STAF Student Portal" },
      { name: "description", content: "Vos règlements, le reste à payer et l'accès au contenu de chaque formation." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { summary, items, isLoading, isError, refetch } = usePaymentsSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Librairie"
        title="Paiements"
        description="Suivez vos règlements, le reste à payer et le seuil d'accès au contenu de chaque formation."
      />

      {isLoading ? (
        <PaymentsSkeleton />
      ) : isError || !summary ? (
        <div className="space-y-4">
          <EmptyState
            icon={CreditCard}
            title="Impossible de charger vos paiements"
            description="Vérifiez votre connexion, puis réessayez."
          />
          <div className="flex justify-center">
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aucun paiement à afficher"
          description="Vos règlements apparaîtront ici dès que vous serez inscrit à une formation."
        />
      ) : (
        <>
          <PaymentsOverview summary={summary} />

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Détail par formation</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <PaymentTrainingCard key={item.enrollmentId} item={item} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

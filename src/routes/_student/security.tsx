import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MfaStatusCard } from "@/components/mfa/StatusCard";
import { MfaMethodsCard } from "@/components/mfa/MethodsCard";
import { RecoveryCodesCard } from "@/components/mfa/RecoveryCodesCard";
import { useStudentMfaStatus } from "@/stores/useMfaStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_student/security")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Sécurité du compte | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MfaManagePage,
});

function MfaManagePage() {
  const { status, isLoading, isError, refetch } = useStudentMfaStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
      </div>
    );
  }

  if (isError || !status) {
    return (
      <div className="rounded-xl border p-8 text-center text-muted-foreground">
        Impossible de charger les paramètres de sécurité.
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Sécurité du compte</h1>
        <p className="text-sm text-muted-foreground">Gérez la vérification en deux étapes de votre compte.</p>
      </div>
      <MfaStatusCard status={status} />
      <MfaMethodsCard status={status} />
      <RecoveryCodesCard status={status} />
    </div>
  );
}
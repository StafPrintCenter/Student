import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordConfirmDialog } from "@/components/mfa/PasswordConfirmDialog";
import { useEnableStudentMfa, useDisableStudentMfa } from "@/stores/useMfaStore";
import type { APIStudentMfaStatus } from "@/data/mfa";

export function MfaStatusCard({ status }: { status: APIStudentMfaStatus }) {
  const [open, setOpen] = useState(false);
  const enableMutation = useEnableStudentMfa();
  const disableMutation = useDisableStudentMfa();

  const mutation = status.enabled ? disableMutation : enableMutation;

  const onConfirm = (password: string) => {
    mutation.mutate(
      { password },
      {
        onSuccess: () => {
          toast.success(status.enabled ? "MFA désactivée" : "MFA activée");
          setOpen(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
      }
    );
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-12 w-12 place-items-center rounded-xl ${status.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
              }`}
          >
            {status.enabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldOff className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Authentification multi-facteurs</h3>
            <p className="text-sm text-muted-foreground">
              {status.enabled
                ? "Un second facteur est demandé à chaque connexion."
                : "Ajoutez une étape de vérification pour mieux protéger votre compte."}
            </p>
            {status.enforced && (
              <p className="mt-1 text-xs font-medium text-amber-600">Imposée par l'administrateur.</p>
            )}
          </div>
        </div>

        <Button
          variant={status.enabled ? "outline" : "default"}
          className={status.enabled ? "text-destructive hover:bg-destructive/10" : ""}
          onClick={() => setOpen(true)}
          disabled={status.enabled && status.enforced}
        >
          {status.enabled ? "Désactiver" : "Activer"}
        </Button>
      </div>

      <PasswordConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={status.enabled ? "Désactiver la MFA" : "Activer la MFA"}
        description="Confirmez votre mot de passe pour continuer."
        confirmLabel={status.enabled ? "Désactiver" : "Activer"}
        destructive={status.enabled}
        isPending={mutation.isPending}
        onConfirm={onConfirm}
      />
    </div>
  );
}
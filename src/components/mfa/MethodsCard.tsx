import { useState } from "react";
import { toast } from "sonner";
import { Mail, Smartphone, Star, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordConfirmDialog } from "@/components/mfa/PasswordConfirmDialog";
import { TotpSetupDialog } from "@/components/mfa/TotpSetupDialog";
import { useSetStudentMfaDefaultMethod, useDeleteStudentMfaMethod } from "@/stores/useMfaStore";
import type { APIStudentMfaMethod, APIStudentMfaStatus } from "@/data/mfa";

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;

export function MfaMethodsCard({ status }: { status: APIStudentMfaStatus }) {
  const [totpOpen, setTotpOpen] = useState(false);
  const [toDelete, setToDelete] = useState<APIStudentMfaMethod | null>(null);

  const defaultMutation = useSetStudentMfaDefaultMethod();
  const deleteMutation = useDeleteStudentMfaMethod();

  const hasTotp = status.methods.some((m) => m.type === "totp");

  const makeDefault = (method: APIStudentMfaMethod) => {
    defaultMutation.mutate(
      { method: method.type },
      {
        onSuccess: () => toast.success("Méthode par défaut modifiée"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
      }
    );
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <h3 className="font-display text-lg font-semibold">Méthodes de vérification</h3>
        {!hasTotp && (
          <Button size="sm" variant="outline" onClick={() => setTotpOpen(true)} disabled={!status.enabled}>
            <Plus className="mr-1 h-4 w-4" /> Application d'authentification
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {status.methods.map((m) => {
          const isDefault = status.defaultMethod === m.type;
          const Icon = m.type === "totp" ? Smartphone : Mail;
          return (
            <div key={m.id ?? m.type} className="flex flex-wrap items-center gap-3 rounded-xl border p-4">
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{m.label}</span>
                  {isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <Star className="h-3 w-3" /> Par défaut
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {m.hint && <span>{m.hint} · </span>}
                  {m.lastUsedAt ? `Dernière utilisation le ${formatDate(m.lastUsedAt)}` : "Jamais utilisée"}
                </div>
              </div>

              <div className="flex gap-2">
                {!isDefault && m.enabled && (
                  <Button size="sm" variant="outline" onClick={() => makeDefault(m)} disabled={defaultMutation.isPending}>
                    Définir par défaut
                  </Button>
                )}
                {m.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setToDelete(m)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TotpSetupDialog open={totpOpen} onOpenChange={setTotpOpen} />

      <PasswordConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Supprimer « ${toDelete?.label ?? ""} »`}
        description="Confirmez votre mot de passe pour supprimer cette méthode."
        confirmLabel="Supprimer"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={(password) => {
          if (!toDelete?.id) return;
          deleteMutation.mutate(
            { id: toDelete.id, password },
            {
              onSuccess: () => { toast.success("Méthode supprimée"); setToDelete(null); },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
            }
          );
        }}
      />
    </div>
  );
}
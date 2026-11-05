import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PasswordConfirmDialog } from "@/components/mfa/PasswordConfirmDialog";
import { useRegenerateStudentRecoveryCodes } from "@/stores/useMfaStore";
import type { APIStudentMfaStatus } from "@/data/mfa";

export function RecoveryCodesCard({ status }: { status: APIStudentMfaStatus }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [codes, setCodes] = useState<string[] | null>(null);
  const regenerateMutation = useRegenerateStudentRecoveryCodes();

  const copy = async () => {
    if (!codes) return;
    await navigator.clipboard.writeText(codes.join("\n"));
    toast.success("Codes copiés");
  };

  const download = () => {
    if (!codes) return;
    const url = URL.createObjectURL(new Blob([codes.join("\n")], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "codes-de-recuperation.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-display text-lg font-semibold">Codes de récupération</h3>
            <p className="text-sm text-muted-foreground">
              {status.recoveryCodesRemaining} code(s) restant(s)
              {status.recoveryCodesGeneratedAt &&
                ` · générés le ${new Date(status.recoveryCodesGeneratedAt).toLocaleDateString("fr-FR")}`}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setConfirmOpen(true)} disabled={!status.enabled}>
          Générer de nouveaux codes
        </Button>
      </div>

      <PasswordConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Générer de nouveaux codes"
        description="Confirmez votre mot de passe pour générer vos codes de récupération."
        confirmLabel="Générer"
        isPending={regenerateMutation.isPending}
        onConfirm={(password) =>
          regenerateMutation.mutate(
            { password },
            {
              onSuccess: (res) => { setCodes(res.recoveryCodes); setConfirmOpen(false); },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
            }
          )
        }
      />

      <Dialog open={!!codes} onOpenChange={(v) => !v && setCodes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vos codes de récupération</DialogTitle>
            <DialogDescription>
              Conservez-les en lieu sûr : ils ne seront plus affichés après la fermeture de cette fenêtre.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/30 p-4">
            {codes?.map((c) => <code key={c} className="text-sm">{c}</code>)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={copy}><Copy className="mr-1 h-4 w-4" /> Copier</Button>
            <Button variant="outline" onClick={download}><Download className="mr-1 h-4 w-4" /> Télécharger</Button>
            <Button onClick={() => setCodes(null)}>J'ai noté mes codes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
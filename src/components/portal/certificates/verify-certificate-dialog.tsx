import { useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Loader2, RefreshCw, ShieldAlert, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { certificateValidityStatusMap } from "@/data/certificates";
import { useVerifyCertificate } from "@/stores/useCertificatesStore";

interface VerifyCertificateDialogProps {
  number: string;
  onClose: () => void;
}

export function VerifyCertificateDialog({ number, onClose }: VerifyCertificateDialogProps) {
  const verifyMutation = useVerifyCertificate();

  // La vérification démarre à l'ouverture du dialog
  useEffect(() => {
    verifyMutation.mutate(number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number]);

  const result = verifyMutation.data;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vérification du certificat</DialogTitle>
          <DialogDescription className="font-mono text-xs">{number}</DialogDescription>
        </DialogHeader>

        {verifyMutation.isPending && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Vérification en cours…
          </div>
        )}

        {verifyMutation.isError && (
          <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <ShieldAlert className="h-4 w-4" /> La vérification a échoué
            </p>
            <p className="text-xs text-muted-foreground">
              {verifyMutation.error instanceof Error ? verifyMutation.error.message : "Erreur inconnue"}
            </p>
            <Button size="sm" variant="outline" onClick={() => verifyMutation.mutate(number)}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Réessayer
            </Button>
          </div>
        )}

        {result && !result.valid && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="space-y-1">
              <p className="font-semibold">Certificat non reconnu</p>
              <p className="text-xs text-muted-foreground">Aucun certificat valide ne correspond à ce numéro.</p>
            </div>
          </div>
        )}

        {result?.valid && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success/5 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div className="space-y-1">
                <p className="font-semibold">Certificat authentique</p>
                {result.status && (
                  <Badge
                    variant="outline"
                    className={cn("font-medium", certificateValidityStatusMap[result.status].className)}
                  >
                    {certificateValidityStatusMap[result.status].label}
                  </Badge>
                )}
              </div>
            </div>

            <dl className="space-y-3 text-sm">
              <Row label="Titulaire" value={result.studentName} />
              <Row label="Formation" value={result.trainingTitle} />
              <Row label="Formateur" value={result.instructorName} />
              <Row
                label="Délivré le"
                value={result.issuedAt ? format(new Date(result.issuedAt), "d MMMM yyyy", { locale: fr }) : undefined}
              />
            </dl>
          </div>
        )}

        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
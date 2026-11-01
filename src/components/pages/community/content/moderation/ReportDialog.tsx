import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReportReasonOptions } from "./ReportReasonOptions";
import {
  COMMUNITY_REPORT_LIMITS,
  type CommunityContentTarget,
  type CommunityReportReason,
} from "@/data/community";
import { CommunityApiError, useReportCommunityContent } from "@/stores/useCommunityModerationStore";
import { markContentReported } from "@/stores/useReportedContentStore";

interface ReportDialogProps {
  target: CommunityContentTarget;
  /** « cette publication » ou « ce commentaire » */
  noun: string;
  onClose: () => void;
}

export function ReportDialog({ target, noun, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<CommunityReportReason | "">("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; details?: string }>({});
  const mutation = useReportCommunityContent();
  const needsDetails = reason === "other";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = details.trim();

    if (!reason) {
      setErrors({ reason: "Choisissez un motif." });
      return;
    }
    if (reason === "other" && !trimmed) {
      setErrors({ details: "Précisez le motif de votre signalement." });
      return;
    }
    setErrors({});

    mutation.mutate(
      { target, payload: { reason, details: trimmed || undefined } },
      {
        onSuccess: (result) => {
          markContentReported(target);
          toast.success(result.message);
          onClose();
        },
        onError: (err) => {
          // 409 : déjà signalé auparavant (page rechargée depuis)
          if (err instanceof CommunityApiError && err.status === 409) {
            markContentReported(target);
            toast.info(err.message);
            onClose();
            return;
          }
          toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi du signalement");
        },
      }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !mutation.isPending && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Signaler {noun}</DialogTitle>
          <DialogDescription>
            Votre signalement est confidentiel et sera examiné par la modération. Vous ne pouvez signaler un contenu qu'une
            seule fois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <ReportReasonOptions
              value={reason}
              onChange={(next) => {
                setReason(next);
                setErrors({});
              }}
              disabled={mutation.isPending}
            />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="report-details">{needsDetails ? "Précisions" : "Précisions (facultatif)"}</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {details.length}/{COMMUNITY_REPORT_LIMITS.detailsMax}
              </span>
            </div>
            <Textarea
              id="report-details"
              rows={3}
              value={details}
              maxLength={COMMUNITY_REPORT_LIMITS.detailsMax}
              disabled={mutation.isPending}
              onChange={(e) => {
                setDetails(e.target.value);
                setErrors((prev) => ({ ...prev, details: undefined }));
              }}
              placeholder="Expliquez ce qui pose problème…"
            />
            {errors.details && <p className="text-xs text-destructive">{errors.details}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Envoi…
                </>
              ) : (
                "Envoyer le signalement"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMUNITY_MODERATION_LIMITS } from "@/data/community";

interface HideReasonDialogProps {
  /** « cette publication » ou « ce commentaire » */
  noun: string;
  isPending: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function HideReasonDialog({ noun, isPending, onConfirm, onClose }: HideReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Le motif est obligatoire.");
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !isPending && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Masquer {noun} ?</DialogTitle>
          <DialogDescription>
            Le contenu ne sera plus visible que par son auteur et par les modérateurs. Le motif est communiqué à l'auteur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="hide-reason">Motif</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {reason.length}/{COMMUNITY_MODERATION_LIMITS.reasonMax}
              </span>
            </div>
            <Textarea
              id="hide-reason"
              rows={3}
              autoFocus
              value={reason}
              maxLength={COMMUNITY_MODERATION_LIMITS.reasonMax}
              disabled={isPending}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              placeholder="Pourquoi masquer ce contenu ?"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Masquage…
                </>
              ) : (
                "Masquer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
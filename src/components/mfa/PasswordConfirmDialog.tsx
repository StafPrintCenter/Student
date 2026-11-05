import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";

const schema = z.object({ password: z.string().min(1, "Le mot de passe est requis") });

export function PasswordConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending,
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  isPending: boolean;
  destructive?: boolean;
  onConfirm: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setPassword(""); setError(""); }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError("");
    onConfirm(parsed.data.password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div>
            <Label htmlFor="mfa-password">Mot de passe actuel</Label>
            <PasswordInput
              id="mfa-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
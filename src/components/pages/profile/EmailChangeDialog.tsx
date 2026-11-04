import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { useRequestStudentEmailChange, useConfirmStudentEmailChange } from "@/stores/useAccountStore";
import type { StudentEmailChangeRequestResponse } from "@/data/account";

const requestSchema = z.object({
  newEmail: z.string().trim().min(1, "La nouvelle adresse est requise").email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
const confirmSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Le code contient 6 chiffres"),
});

export function EmailChangeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { setUser } = useStudentAuth();
  const requestMutation = useRequestStudentEmailChange();
  const confirmMutation = useConfirmStudentEmailChange();

  const [step, setStep] = useState<"request" | "confirm">("request");
  const [requestForm, setRequestForm] = useState({ newEmail: "", password: "" });
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<StudentEmailChangeRequestResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setStep("request");
      setRequestForm({ newEmail: "", password: "" });
      setCode("");
      setInfo(null);
      setErrors({});
    }
  }, [open]);

  const toErrors = (issues: z.ZodIssue[]) => {
    const errs: Record<string, string> = {};
    issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
    return errs;
  };

  const submitRequest = () => {
    const parsed = requestSchema.safeParse(requestForm);
    if (!parsed.success) return setErrors(toErrors(parsed.error.issues));
    setErrors({});

    requestMutation.mutate(parsed.data, {
      onSuccess: (res) => { setInfo(res); setStep("confirm"); toast.success(res.message); },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la demande"),
    });
  };

  const submitConfirm = () => {
    const parsed = confirmSchema.safeParse({ code });
    if (!parsed.success) return setErrors(toErrors(parsed.error.issues));
    setErrors({});

    confirmMutation.mutate(parsed.data, {
      onSuccess: (profile) => {
        setUser(profile);
        toast.success("Adresse e-mail modifiée");
        onOpenChange(false);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Code invalide ou expiré"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer mon adresse e-mail</DialogTitle>
          <DialogDescription>
            {step === "request"
              ? "Un code de confirmation sera envoyé à la nouvelle adresse."
              : `Code envoyé à ${info?.hint}. Il expire dans ${info?.expiresInMinutes} minutes.`}
          </DialogDescription>
        </DialogHeader>

        {step === "request" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-email">Nouvelle adresse e-mail</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="email"
                value={requestForm.newEmail}
                onChange={(e) => setRequestForm({ ...requestForm, newEmail: e.target.value })}
                disabled={requestMutation.isPending}
              />
              {errors.newEmail && <p className="mt-1 text-xs text-destructive">{errors.newEmail}</p>}
            </div>
            <div>
              <Label htmlFor="email-pw">Mot de passe actuel</Label>
              <PasswordInput
                id="email-pw"
                autoComplete="current-password"
                value={requestForm.password}
                onChange={(e) => setRequestForm({ ...requestForm, password: e.target.value })}
                disabled={requestMutation.isPending}
              />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="email-code">Code de confirmation</Label>
            <Input
              id="email-code"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={confirmMutation.isPending}
            />
            {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
          </div>
        )}

        <DialogFooter>
          {step === "confirm" && (
            <Button variant="outline" onClick={() => { setStep("request"); setCode(""); setErrors({}); }}>
              Retour
            </Button>
          )}
          {step === "request" ? (
            <Button onClick={submitRequest} disabled={requestMutation.isPending}>
              {requestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le code
            </Button>
          ) : (
            <Button onClick={submitConfirm} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useSetupStudentTotp, useConfirmStudentTotp } from "@/stores/useMfaStore";
import type { APIStudentMfaTotpSetup } from "@/data/mfa";

const passwordSchema = z.object({ password: z.string().min(1, "Le mot de passe est requis") });
const codeSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/, "Le code contient 6 chiffres") });

export function TotpSetupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setupMutation = useSetupStudentTotp();
  const confirmMutation = useConfirmStudentTotp();

  const [step, setStep] = useState<"password" | "confirm">("password");
  const [password, setPassword] = useState("");
  const [setup, setSetup] = useState<APIStudentMfaTotpSetup | null>(null);
  const [code, setCode] = useState("");
  const [makeDefault, setMakeDefault] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep("password");
      setPassword("");
      setSetup(null);
      setCode("");
      setMakeDefault(true);
      setError("");
    }
  }, [open]);

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse({ password });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError("");

    setupMutation.mutate(parsed.data, {
      onSuccess: (data) => { setSetup(data); setStep("confirm"); },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur"),
    });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = codeSchema.safeParse({ code });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError("");

    confirmMutation.mutate(
      { code: parsed.data.code, makeDefault },
      {
        onSuccess: () => { toast.success("Application d'authentification configurée"); onOpenChange(false); },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Code invalide ou expiré"),
      }
    );
  };

  const copySecret = async () => {
    if (!setup) return;
    await navigator.clipboard.writeText(setup.secret);
    toast.success("Clé copiée");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {step === "password" ? (
          <form onSubmit={submitPassword} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Configurer une application d'authentification</DialogTitle>
              <DialogDescription>Confirmez votre mot de passe pour générer la clé.</DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="totp-pw">Mot de passe actuel</Label>
              <PasswordInput
                id="totp-pw"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={setupMutation.isPending}
              />
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={setupMutation.isPending}>
                {setupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuer
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={submitCode} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Scannez le QR code</DialogTitle>
              <DialogDescription>
                Ouvrez votre application (Google Authenticator, Authy…), scannez le code, puis saisissez le code à 6 chiffres affiché.
              </DialogDescription>
            </DialogHeader>

            {setup && (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl border bg-white p-3">
                  <QRCodeSVG value={setup.otpauthUri} size={176} />
                </div>
                <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/30 p-2">
                  <code className="min-w-0 flex-1 break-all text-xs">{setup.secret}</code>
                  <Button type="button" size="sm" variant="outline" onClick={copySecret}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="totp-code">Code de l'application</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                disabled={confirmMutation.isPending}
              />
              {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} />
              Utiliser cette méthode par défaut
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={confirmMutation.isPending}>
                {confirmMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Valider
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
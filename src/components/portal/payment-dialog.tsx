import { useMemo, useState } from "react";
import { Wallet, Smartphone, CreditCard, Landmark, Banknote } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { paymentApi } from "@/lib/api";
import { formatFCFA, minAccessAmount } from "@/lib/api/utils";
import type { Enrollment, PaymentMethod, Training } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface Props {
  training: Training;
  enrollment: Enrollment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const METHODS: { value: PaymentMethod; label: string; icon: any }[] = [
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { value: "card", label: "Carte bancaire", icon: CreditCard },
  { value: "bank_transfer", label: "Virement", icon: Landmark },
  { value: "cash", label: "Espèces", icon: Banknote },
];

export function PaymentDialog({ training, enrollment, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const min = Math.max(0, minAccessAmount(training) - enrollment.amount_paid);
  const totalPrice = training.price + training.registration_fee;
  const totalPaid = enrollment.amount_paid;
  const remaining = enrollment.amount_due;
  const paidRatio = Math.min(100, Math.round((totalPaid / totalPrice) * 100));

  const [amount, setAmount] = useState<number>(min > 0 ? min : Math.min(remaining, Math.round(training.price / 4)));
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");

  const presets = useMemo(() => {
    const q = Math.min(remaining, Math.round(training.price / 4));
    const h = Math.min(remaining, Math.round(training.price / 2));
    return [
      { label: "¼ (accès)", value: q },
      { label: "½", value: h },
      { label: "Total restant", value: remaining },
    ].filter((p) => p.value > 0);
  }, [remaining, training.price]);

  const pay = useMutation({
    mutationFn: () => paymentApi.create({ enrollment_uuid: enrollment.uuid, amount, method }),
    onSuccess: () => {
      toast.success("Paiement enregistré.");
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      onOpenChange(false);
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const tooLow = amount < min;
  const tooHigh = amount > remaining;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> Paiement de la formation
          </DialogTitle>
          <DialogDescription>
            {min > 0
              ? `Réglez au minimum ${formatFCFA(min)} pour débloquer le contenu complet.`
              : "Vous pouvez régler tout ou partie du solde restant."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prix total</span>
              <span className="tabular-nums font-medium">{formatFCFA(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Déjà payé</span>
              <span className="tabular-nums font-medium text-success">{formatFCFA(totalPaid)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Restant</span>
              <span className="tabular-nums font-medium">{formatFCFA(remaining)}</span>
            </div>
            <Progress value={paidRatio} className="h-1.5" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setAmount(p.value)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs text-center transition-colors",
                  amount === p.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:bg-muted",
                )}
              >
                <p className="font-medium">{p.label}</p>
                <p className="tabular-nums text-muted-foreground">{formatFCFA(p.value)}</p>
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Montant personnalisé (XOF)</Label>
            <Input
              id="amount"
              type="number"
              min={min}
              max={remaining}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            {tooLow && (
              <p className="text-xs text-destructive">
                Le montant minimum pour débloquer est {formatFCFA(min)}.
              </p>
            )}
            {tooHigh && (
              <p className="text-xs text-destructive">
                Vous ne pouvez pas payer plus que le restant ({formatFCFA(remaining)}).
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Méthode de paiement</Label>
            <div className="grid grid-cols-2 gap-2">
              {METHODS.map((m) => {
                const active = method === m.value;
                const Icon = m.icon;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      active ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => pay.mutate()}
            disabled={tooLow || tooHigh || amount <= 0 || pay.isPending}
          >
            {pay.isPending ? "Traitement…" : `Payer ${formatFCFA(amount)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CreditCard, Wallet, Banknote, Smartphone, Building2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/page-header";
import { StatCard } from "@/components/portal/stat-card";
import { PaymentBadge } from "@/components/portal/status-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentApi } from "@/lib/api";
import { formatFCFA } from "@/lib/api/utils";
import type { PaymentMethod } from "@/lib/api/types";

export const Route = createFileRoute("/_portal/payments")({
  head: () => ({
    meta: [
      { title: "Paiements - STAF Student Portal" },
      { name: "description", content: "Suivi de vos paiements, factures et reçus." },
      { property: "og:title", content: "Paiements - STAF" },
      { property: "og:description", content: "Factures, reçus et paiements en cours." },
    ],
  }),
  component: PaymentsPage,
});

const METHOD_ICONS: Record<PaymentMethod, any> = {
  mobile_money: Smartphone,
  card: CreditCard,
  bank_transfer: Building2,
  cash: Banknote,
};
const METHOD_LABELS: Record<PaymentMethod, string> = {
  mobile_money: "Mobile Money",
  card: "Carte bancaire",
  bank_transfer: "Virement",
  cash: "Espèces",
};

function PaymentsPage() {
  const { data: summary } = useQuery({ queryKey: ["pay-summary"], queryFn: paymentApi.summary });
  const { data: payments } = useQuery({ queryKey: ["payments"], queryFn: paymentApi.list });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Facturation"
        title="Paiements"
        description="Consultez vos soldes, réglez en ligne et téléchargez vos justificatifs."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total réglé" value={formatFCFA(summary?.totalPaid ?? 0)} icon={Wallet} tone="success" />
        <StatCard label="Solde à régler" value={formatFCFA(summary?.totalDue ?? 0)} icon={CreditCard} tone="warning" />
        <StatCard label="Transactions" value={payments?.length ?? 0} icon={Banknote} tone="info" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Soldes par formation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {summary?.rows.map((r) => (
            <div key={r.enrollment.uuid} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{r.training.title}</p>
                <p className="text-xs text-muted-foreground">
                  Échéance : {format(new Date(r.training.end_date), "d MMM yyyy", { locale: fr })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Payé</p>
                  <p className="tabular-nums font-medium">{formatFCFA(r.enrollment.amount_paid)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Restant</p>
                  <p className="tabular-nums font-semibold">{formatFCFA(r.enrollment.amount_due)}</p>
                </div>
                <PaymentBadge status={r.enrollment.payment_status} />
                <PayDialog
                  enrollmentUuid={r.enrollment.uuid}
                  trainingTitle={r.training.title}
                  amountDue={r.enrollment.amount_due}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Historique</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((p) => {
                const Icon = METHOD_ICONS[p.method];
                return (
                  <TableRow key={p.uuid}>
                    <TableCell className="text-sm">
                      {format(new Date(p.paid_at), "d MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {METHOD_LABELS[p.method]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatFCFA(p.amount)}
                    </TableCell>
                    <TableCell><PaymentBadge status={p.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Reçu</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PayDialog({
  enrollmentUuid,
  trainingTitle,
  amountDue,
}: {
  enrollmentUuid: string;
  trainingTitle: string;
  amountDue: number;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(amountDue);
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const mut = useMutation({
    mutationFn: () => paymentApi.create({ enrollment_uuid: enrollmentUuid, amount, method }),
    onSuccess: () => {
      toast.success("Paiement enregistré.");
      qc.invalidateQueries({ queryKey: ["pay-summary"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
      setOpen(false);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (amountDue <= 0) return <Button size="sm" variant="outline" disabled>À jour</Button>;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Payer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Régler - {trainingTitle}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Méthode</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="card">Carte bancaire</SelectItem>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="cash">Espèces (à l'accueil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Montant (XOF)</Label>
            <Input
              type="number"
              value={amount}
              min={1}
              max={amountDue}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Solde restant : {formatFCFA(amountDue)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || amount <= 0}>
            Confirmer le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/format";
import type { APIProgressStats } from "@/data/progress";

export function ProgressFinanceCard({ finance }: { finance: APIProgressStats["finance"] }) {
  const paidPercent =
    finance.totalDue > 0 ? Math.min(100, Math.round((finance.totalPaid / finance.totalDue) * 100)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4 text-primary" /> Vue d'ensemble financière
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Figure label="Total dû" value={formatFCFA(finance.totalDue)} />
          <Figure label="Déjà réglé" value={formatFCFA(finance.totalPaid)} className="text-success" />
          <Figure label="Reste à payer" value={formatFCFA(finance.totalRemaining)} className="text-warning" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Règlement global</span>
            <span className="tabular-nums">{paidPercent}%</span>
          </div>
          <Progress value={paidPercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function Figure({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("truncate text-sm font-semibold tabular-nums", className)}>{value}</p>
    </div>
  );
}
import { Badge } from "@/components/ui/badge";
import type {
  CertificateStatus,
  EnrollmentStatus,
  PaymentStatus,
  TicketStatus,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

const enrollmentMap: Record<EnrollmentStatus, { label: string; className: string }> = {
  pending_approval: { label: "En attente de validation", className: "bg-warning/15 text-warning-foreground border-warning/40" },
  awaiting_initial_payment: { label: "Paiement d'accès requis", className: "bg-warning/15 text-warning-foreground border-warning/40" },
  waiting_payment: { label: "En attente de paiement", className: "bg-warning/15 text-warning-foreground border-warning/40" },
  confirmed: { label: "Confirmée", className: "bg-info/15 text-info border-info/40" },
  in_progress: { label: "En cours", className: "bg-primary/15 text-primary border-primary/40" },
  completed: { label: "Terminée", className: "bg-success/15 text-success border-success/40" },
  cancelled: { label: "Annulée", className: "bg-muted text-muted-foreground border-border" },
  suspended: { label: "Suspendue", className: "bg-destructive/10 text-destructive border-destructive/40" },
  expired: { label: "Expirée", className: "bg-muted text-muted-foreground border-border" },
};

const paymentMap: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-warning/15 text-warning-foreground border-warning/40" },
  partial: { label: "Partiel", className: "bg-info/15 text-info border-info/40" },
  paid: { label: "Payé", className: "bg-success/15 text-success border-success/40" },
  overdue: { label: "En retard", className: "bg-destructive/10 text-destructive border-destructive/40" },
  cancelled: { label: "Annulé", className: "bg-muted text-muted-foreground border-border" },
  refunded: { label: "Remboursé", className: "bg-muted text-muted-foreground border-border" },
};

const certMap: Record<CertificateStatus, { label: string; className: string }> = {
  not_eligible: { label: "Non éligible", className: "bg-muted text-muted-foreground border-border" },
  eligible: { label: "Éligible", className: "bg-info/15 text-info border-info/40" },
  issued: { label: "Émis", className: "bg-success/15 text-success border-success/40" },
  downloaded: { label: "Téléchargé", className: "bg-success/15 text-success border-success/40" },
  revoked: { label: "Révoqué", className: "bg-destructive/10 text-destructive border-destructive/40" },
};

const ticketMap: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Ouvert", className: "bg-info/15 text-info border-info/40" },
  pending: { label: "En attente", className: "bg-warning/15 text-warning-foreground border-warning/40" },
  resolved: { label: "Résolu", className: "bg-success/15 text-success border-success/40" },
  closed: { label: "Fermé", className: "bg-muted text-muted-foreground border-border" },
};

export function EnrollmentBadge({ status }: { status: EnrollmentStatus }) {
  const { label, className } = enrollmentMap[status];
  return <Badge variant="outline" className={cn("font-medium", className)}>{label}</Badge>;
}
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const { label, className } = paymentMap[status];
  return <Badge variant="outline" className={cn("font-medium", className)}>{label}</Badge>;
}
export function CertificateBadge({ status }: { status: CertificateStatus }) {
  const { label, className } = certMap[status];
  return <Badge variant="outline" className={cn("font-medium", className)}>{label}</Badge>;
}
export function TicketBadge({ status }: { status: TicketStatus }) {
  const { label, className } = ticketMap[status];
  return <Badge variant="outline" className={cn("font-medium", className)}>{label}</Badge>;
}

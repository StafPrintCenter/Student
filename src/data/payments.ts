import type { TrainingEnrollmentStatus, TrainingPaymentStatus } from "@/data/trainings";

/** Aligné sur App\Enums\PaymentMethod (backend) */
export type PaymentMethod = "cash" | "mobile_money" | "bank_transfer" | "other";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Espèces",
  mobile_money: "Mobile Money",
  bank_transfer: "Virement bancaire",
  other: "Autre",
};

export type APITrainingPayment = {
  paymentId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  /** Reste à payer après ce paiement */
  remaining: number;
};

/** GET /api/student/trainings/catalogs/{trainingId}/payments */
export type APITrainingPaymentsSummary = {
  trainingId: string;
  trainingTitle: string;
  totalAmount: number;
  amountPaid: number;
  remaining: number;
  paymentStatus: TrainingPaymentStatus;
  accessUnlocked: boolean;
  /** Montant minimum à régler pour débloquer le contenu */
  accessMinAmount: number;
  paymentsCount: number;
  payments: APITrainingPayment[];
};

export type APIPaymentsOverview = {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
  paidPercent: number;
  trainingsCount: number;
  /** Nombre de formations par statut de paiement (un statut sans formation est absent) */
  byPaymentStatus: Partial<Record<TrainingPaymentStatus, number>>;
  lastPaymentAt: string | null;
};

export type APITrainingPaymentItem = {
  enrollmentId: string;
  trainingId: string;
  trainingTitle: string;
  coverColor: string;
  totalDue: number;
  totalPaid: number;
  remaining: number;
  paidPercent: number;
  paymentStatus: TrainingPaymentStatus;
  accessUnlocked: boolean;
  /** Montant minimum à régler pour débloquer le contenu */
  accessMinAmount: number;
  paymentsCount: number;
  lastPaymentAt: string | null;
  enrollmentStatus: TrainingEnrollmentStatus;
};

export type APIPaymentsSummaryResponse = {
  summary: APIPaymentsOverview;
  data: APITrainingPaymentItem[];
};

/** Nombre de paiements affichés dans le détail */
export const PAYMENTS_DISPLAY_LIMIT = 5;
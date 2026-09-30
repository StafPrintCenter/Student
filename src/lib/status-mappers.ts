// src/lib/status-mappers.ts
import type { EnrollmentStatus, PaymentStatus } from "@/lib/api/types";

const KNOWN_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  "pending_approval",
  "awaiting_initial_payment",
  "waiting_payment",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "suspended",
  "expired",
];

export function toEnrollmentStatus(status: string): EnrollmentStatus {
  return (KNOWN_ENROLLMENT_STATUSES as string[]).includes(status)
    ? (status as EnrollmentStatus)
    : "pending_approval";
}

/** L'API student renvoie "unpaid" là où le front attend "pending" */
const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  unpaid: "pending",
  pending: "pending",
  partial: "partial",
  paid: "paid",
  overdue: "overdue",
  cancelled: "cancelled",
  refunded: "refunded",
};

export function toPaymentStatus(status: string): PaymentStatus {
  return PAYMENT_STATUS_MAP[status] ?? "pending";
}
// Shared mock helpers.
import type { Enrollment, Training } from "./types";

export const LATENCY_MS = 320;

export function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowISO() {
  return new Date().toISOString();
}

export function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-BJ", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

// --- Access rules ---
// Learners must pay at least a quarter of the training price before
// unlocking the full course content (modules, lessons, quiz, exercises).
export const ACCESS_MIN_RATIO = 0.25;

export function minAccessAmount(training: Pick<Training, "price">) {
  return Math.round(training.price * ACCESS_MIN_RATIO);
}

export function hasUnlockedAccess(
  enrollment: Pick<Enrollment, "amount_paid">,
  training: Pick<Training, "price">,
) {
  return enrollment.amount_paid >= minAccessAmount(training);
}

export function remainingToUnlock(
  enrollment: Pick<Enrollment, "amount_paid">,
  training: Pick<Training, "price">,
) {
  return Math.max(0, minAccessAmount(training) - enrollment.amount_paid);
}

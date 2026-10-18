import type { LessonKind } from "@/data/trainings";

/* ---- Progression (video / reading) ---- */

/**
 * Payload de POST /api/student/lessons/{lessonId}/progress
 * — "video" : watched_seconds requis
 * — "reading" : completed optionnel (true par défaut côté backend)
 */
export type LessonProgressPayload =
  | { watched_seconds: number; completed?: never }
  | { completed?: boolean; watched_seconds?: never };

export type LessonProgressStatus = "in_progress" | "completed";

/** Réponse de POST /api/student/lessons/{lessonId}/progress */
export type APILessonProgressResult = {
  lessonId: string;
  status: LessonProgressStatus;
  /** Renvoyé par le backend sous forme de string décimale, ex: "0.00" */
  completionRatio: string;
  /** Nouvelle progression globale de l'inscription (0-100) */
  enrollmentProgress: number;
};

/* ---- Soumissions (exercise / assignment / project) ---- */

/** Aligné sur App\Enums\SubmissionStatus (backend) */
export type SubmissionStatus = "submitted" | "under_review" | "validated" | "rejected";

export const submissionStatusMap: Record<SubmissionStatus, { label: string; className: string }> = {
  submitted: { label: "Soumis", className: "bg-info/15 text-info border-info/40" },
  under_review: { label: "En correction", className: "bg-warning/15 text-warning-foreground border-warning/40" },
  validated: { label: "Validé", className: "bg-success/15 text-success border-success/40" },
  rejected: { label: "À reprendre", className: "bg-destructive/10 text-destructive border-destructive/40" },
};

/**
 * Payload de POST /api/student/lessons/{lessonId}/submissions/create
 * Au moins l'un des deux champs est requis (422 côté backend sinon).
 */
export type SubmissionPayload = {
  body?: string;
  file?: File;
};

/** Réponse de POST /api/student/lessons/{lessonId}/submissions/create */
export type APISubmissionResult = {
  id: string;
  status: SubmissionStatus;
  submittedAt: string;
};

/** Leçons pour lesquelles un dépôt de travail est pertinent */
export const SUBMITTABLE_LESSON_KINDS: LessonKind[] = ["exercise", "assignment", "project"];

/** Message de succès selon le comportement du backend : un exercice est terminé au dépôt, les autres attendent la correction */
export const submissionSuccessMessages: Partial<Record<LessonKind, string>> = {
  exercise: "Exercice terminé : votre dépôt a été enregistré.",
  assignment: "Devoir déposé : il sera corrigé par votre formateur.",
  project: "Projet déposé : il sera corrigé par votre formateur.",
};

export type { LessonKind };
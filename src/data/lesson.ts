import type { LessonKind } from "@/data/trainings";

/**
 * — "video" : watched_seconds requis
 * — "reading" : completed optionnel (true par défaut côté backend)
 */
export type LessonProgressPayload =
  | { watched_seconds: number; completed?: never }
  | { completed?: boolean; watched_seconds?: never };

export type LessonProgressStatus = "in_progress" | "completed";

/** Réponse de POST /api/v1/student/lessons/{lessonId}/progress */
export type APILessonProgressResult = {
  lessonId: string;
  status: LessonProgressStatus;
  /** Renvoyé par le backend sous forme de string décimale, ex: "0.00" */
  completionRatio: string;
  /** Nouvelle progression globale de l'inscription (0-100) */
  enrollmentProgress: number;
};

/** Message affiché après un dépôt réussi, selon le comportement du backend par type de leçon */
export const submissionSuccessMessages: Partial<Record<LessonKind, string>> = {
  exercise: "Exercice terminé : votre dépôt a été enregistré.",
  assignment: "Devoir déposé : il sera corrigé par votre formateur.",
  project: "Projet déposé : il sera corrigé par votre formateur.",
};

export type { LessonKind };
import type { LessonKind } from "@/data/trainings";

/* ---- Progression ---- */

export type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export const lessonProgressStatusMap: Record<LessonProgressStatus, { label: string; className: string }> = {
  not_started: { label: "Non commencée", className: "bg-muted text-muted-foreground border-border" },
  in_progress: { label: "En cours", className: "bg-info/15 text-info border-info/40" },
  completed: { label: "Terminée", className: "bg-success/15 text-success border-success/40" },
};

/**
 * Payload de POST /api/student/lessons/{lessonId}/progress
 * — "video" : watched_seconds requis
 * — "reading" : completed optionnel (true par défaut côté backend)
 */
export type LessonProgressPayload =
  | { watched_seconds: number; completed?: never }
  | { completed?: boolean; watched_seconds?: never };

/** Réponse de POST /api/student/lessons/{lessonId}/progress */
export type APILessonProgressResult = {
  lessonId: string;
  status: LessonProgressStatus;
  /** String décimale renvoyée par le backend, ex: "0.00" */
  completionRatio: string;
  /** Nouvelle progression globale de l'inscription (0-100) */
  enrollmentProgress: number;
};

/** Progression de l'étudiant sur une leçon (détail de formation et détail de leçon) */
export type APILessonProgress = {
  status: LessonProgressStatus;
  isCompleted: boolean;
  /** Pourcentage ("100.00") : pertinent pour les vidéos uniquement, null tant que non commencée */
  completionRatio: string | null;
  watchedSeconds: number | null;
  bestScore: number | null;
  completedAt: string | null;
  lastActivityAt: string | null;
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

/** Payload de POST /api/student/lessons/{lessonId}/submissions/create (au moins un des deux champs) */
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

export const SUBMITTABLE_LESSON_KINDS: LessonKind[] = ["exercise", "assignment", "project"];

/** Un exercice est terminé au dépôt, les autres attendent la correction */
export const submissionSuccessMessages: Partial<Record<LessonKind, string>> = {
  exercise: "Exercice terminé : votre dépôt a été enregistré.",
  assignment: "Devoir déposé : il sera corrigé par votre formateur.",
  project: "Projet déposé : il sera corrigé par votre formateur.",
};

export type APILessonSubmissionFeedback = {
  note: number | null;
  comment: string | null;
  validated: boolean;
  gradedAt: string | null;
};

/** Dépôt tel que renvoyé dans le détail de formation (dernier dépôt) et le détail de leçon (liste) */
export type APILessonSubmission = {
  id: string;
  status: SubmissionStatus;
  body: string | null;
  fileUrl: string | null;
  submittedAt: string;
  feedback: APILessonSubmissionFeedback | null;
  attemptsCount: number;
};

/* ---- Détail d'une leçon : GET /api/student/trainings/lessons/{lessonId} ---- */

export type APILessonLink = { id: string; title: string };

export type APILessonDetail = {
  id: string;
  title: string;
  kind: LessonKind;
  durationMinutes: number | null;
  isMandatory: boolean;
  brief: string | null;
  content: string | null;
  videoUrl: string | null;
  chapters: string[] | null;
  quizId: string | null;
  module: { id: string; title: string };
  trainingId: string;
  enrollmentId: string;
  contentLocked: boolean;
  /** true pour les leçons vidéo / lecture dont la progression peut être enregistrée */
  canMarkProgress: boolean;
  /** true quand un nouveau dépôt est possible */
  canSubmitWork: boolean;
  progress: APILessonProgress;
  submissions: APILessonSubmission[];
  previousLesson: APILessonLink | null;
  nextLesson: APILessonLink | null;
};

export type { LessonKind };
export type QuizQuestionType = "single" | "multiple";

export type APIQuizChoice = {
  id: string;
  label: string;
  sortOrder: number;
};

export type APIQuizQuestion = {
  id: string;
  prompt: string;
  type: QuizQuestionType;
  points: number;
  sortOrder: number;
  /** Facultatif : à n'afficher que s'il est présent */
  explanation?: string | null;
  choices: APIQuizChoice[];
};

export type APIQuiz = {
  id: string;
  lessonId: string;
  /** Seule la valeur "exercise" est connue pour l'instant */
  mode: string;
  /** null = pas de limite de temps */
  timeLimitSec: number | null;
  /** Seuil de réussite, comparé tel quel au score par le backend */
  passScore: number;
  maxAttempts: number | null;
  totalPoints: number;
  questions: APIQuizQuestion[];
};

/** Réponse de POST /api/v1/student/quizzes/{quizId}/start */
export type APIQuizStartResult = {
  attemptId: string;
  startedAt: string;
  timeLimitSec: number | null;
  quiz: APIQuiz;
};

/** Format attendu par le backend : { [questionId]: [choiceId, ...] } (envoyé en JSON dans le champ "answers") */
export type QuizAnswers = Record<string, string[]>;

/** Statuts rencontrés dans SubmitController (in_progress / graded / expired) */
export type QuizAttemptStatus = "in_progress" | "graded" | "expired";

export const quizAttemptStatusMap: Record<QuizAttemptStatus, { label: string; className: string }> = {
  in_progress: { label: "En cours", className: "bg-info/15 text-info border-info/40" },
  graded: { label: "Corrigée", className: "bg-success/15 text-success border-success/40" },
  expired: { label: "Expirée", className: "bg-muted text-muted-foreground border-border" },
};

export const quizModeLabels: Record<string, string> = {
  exercise: "Exercice",
};

/** Un élément de GET /api/v1/student/quizzes/{quizId}/attempts */
export type APIQuizAttempt = {
  attemptId: string;
  attemptNumber: number;
  status: QuizAttemptStatus;
  score: number | null;
  isAutoSubmitted: boolean;
  startedAt: string;
  submittedAt: string | null;
};

export type APIQuizAttemptsResponse = {
  data: APIQuizAttempt[];
  bestScore: number | null;
};

export type APIQuizAnswerResult = {
  questionId: string;
  prompt: string;
  selectedChoiceIds: string[];
  correctChoiceIds: string[];
  isCorrect: boolean;
  pointsAwarded: number;
  explanation: string | null;
};

/** Réponse de POST /api/v1/student/quiz-attempts/{attemptId}/submit */
export type APIQuizSubmitResult = {
  attemptId: string;
  score: number;
  passed: boolean;
  isAutoSubmitted: boolean;
  answers: APIQuizAnswerResult[];
};
/** Rôle d'un formateur sur une formation */
export type TrainingInstructorRole = "lead" | "assistant";

export const trainingInstructorRoleLabels: Record<TrainingInstructorRole, string> = {
  lead: "Formateur principal",
  assistant: "Formateur assistant",
};

/** Aligné sur App\Enums\TrainingLevel (backend) */
export type TrainingLevel = "Débutant" | "Intermédiaire" | "Avancé";

/** Aligné sur App\Enums\EnrollmentStatus (backend) */
export type TrainingEnrollmentStatus =
  | "confirmed"
  | "in_progress"
  | "completed"
  | "waiting_list"
  | "cancelled"
  | "expired";

/** Aligné sur App\Enums\PaymentStatus (backend) */
export type TrainingPaymentStatus = "unpaid" | "partial" | "paid";

/** Aligné sur App\Enums\LessonKind (backend) */
export type LessonKind = "video" | "reading" | "quiz" | "exercise" | "assignment" | "project";

export const lessonKindLabels: Record<LessonKind, string> = {
  video: "Vidéo",
  reading: "Lecture",
  quiz: "Quiz",
  exercise: "Exercice",
  assignment: "Devoir à rendre",
  project: "Projet",
};

/** Leçons dont la progression se suit via MarkProgressController (/student/lessons/{id}/progress) */
export const TRACKABLE_LESSON_KINDS: LessonKind[] = ["video", "reading"];

interface StatusBadgeConfig {
  label: string;
  className: string;
}

/** Badges dédiés aux formations */
export const trainingEnrollmentStatusMap: Record<TrainingEnrollmentStatus, StatusBadgeConfig> = {
  confirmed: { label: "Confirmée", className: "bg-info/15 text-info border-info/40" },
  in_progress: { label: "En cours", className: "bg-primary/15 text-primary border-primary/40" },
  completed: { label: "Terminée", className: "bg-success/15 text-success border-success/40" },
  waiting_list: { label: "Liste d'attente", className: "bg-warning/15 text-warning-foreground border-warning/40" },
  cancelled: { label: "Annulée", className: "bg-muted text-muted-foreground border-border" },
  expired: { label: "Expirée", className: "bg-muted text-muted-foreground border-border" },
};

export const trainingPaymentStatusMap: Record<TrainingPaymentStatus, StatusBadgeConfig> = {
  unpaid: { label: "Non payé", className: "bg-warning/15 text-warning-foreground border-warning/40" },
  partial: { label: "Partiel", className: "bg-info/15 text-info border-info/40" },
  paid: { label: "Payé", className: "bg-success/15 text-success border-success/40" },
};

/**
 * Une formation à laquelle l'étudiant est inscrit
 */
export type APIStudentTrainingEnrollment = {
  enrollmentId: string;
  trainingId: string;
  trainingTitle: string;
  theme: string;
  level: TrainingLevel;
  maxSeats: number;
  seatsRemaining: number;
  location: string;
  duration: string;
  status: TrainingEnrollmentStatus;
  progress: number;
  paymentStatus: TrainingPaymentStatus;
  accessUnlocked: boolean;
  enrolledAt: string;
  coverColor: string;
};

/**
 * Une formation du catalogue public (vue liste)
 */
export type APIPublicTrainingCatalogItem = {
  id: string;
  title: string;
  themeId: string;
  theme: string;
  duration: string;
  durationHours: number;
  level: TrainingLevel;
  price: number;
  maxSeats: number;
  seatsRemaining: number;
  short: string;
  objectives: string[];
  registrationFee: number;
  accessMinRatio: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  location: string;
  currentStudents: number;
  waitingListEnabled: boolean;
  coverColor: string;
  status: string;
  enrollmentStatus: "open" | "closed" | string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

/** Une section du programme public (formation non encore suivie) */
export type APIPublicTrainingProgramSection = {
  title: string;
  items: string[];
};

/**
 * Détail public d'une formation — accessible sans être inscrit
 * GET /api/v1/public/trainings/catalogs/{id}
 */
export type APIPublicTrainingDetail = APIPublicTrainingCatalogItem & {
  audience: string;
  prerequisites: string[];
  program: APIPublicTrainingProgramSection[];
  certification: string;
  schedule: string;
};

/** Une leçon d'un module (programme détail, étudiant inscrit) */
export type APIStudentTrainingLesson = {
  id: string;
  title: string;
  kind: LessonKind;
  durationMinutes: number | null;
  sortOrder: number;
  isMandatory: boolean;
  brief: string | null;
  content: string | null;
  videoUrl: string | null;
  chapters: string[] | null;
  quizId?: string | null;
};

/** Un module (regroupement de leçons) */
export type APIStudentTrainingModule = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: APIStudentTrainingLesson[];
};

/** Champs "coeur" de la formation renvoyés dans le detail student */
export type APIStudentTrainingDetail = {
  id: string;
  title: string;
  themeId: string;
  theme: string;
  level: TrainingLevel;
  duration: string;
  durationHours: number;
  short: string;
  objectives: string[];
  accessMinRatio: string;
  maxSeats: number;
  seatsRemaining: number;
  location: string;
  coverColor: string;
  startDate: string;
  endDate: string;
};

/** Infos d'inscription de l'étudiant courant pour cette formation */
export type APIStudentTrainingEnrollmentInfo = {
  id: string;
  status: TrainingEnrollmentStatus;
  progress: number;
  paymentStatus: TrainingPaymentStatus;
  amountPaid: number;
  accessUnlocked: boolean;
  enrolledAt: string;
};

/**
 * Réponse complète de GET /api/v1/student/trainings/{id}
 * Renvoyée uniquement si l'étudiant est inscrit (403/404 sinon)
 */
export type APIStudentTrainingDetailResponse = {
  data: APIStudentTrainingDetail;
  enrollment: APIStudentTrainingEnrollmentInfo;
  contentLocked: boolean;
  modules: APIStudentTrainingModule[];
};
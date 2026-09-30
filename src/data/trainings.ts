/** Aligné sur App\Enums\TrainingLevel (backend) */
export type TrainingLevel = "Débutant" | "Intermédiaire" | "Avancé";

/**
 * Une formation à laquelle l'étudiant est inscrit
 * GET /api/v1/student/trainings/list
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
  durationHours: string;
  status: string; // "confirmed" | ...
  progress: number;
  paymentStatus: string; // "unpaid" | "paid" | ...
  accessUnlocked: boolean;
  enrolledAt: string;
};

/**
 * Une formation du catalogue public
 * GET /api/v1/public/trainings/catalogs/list
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

/** Une leçon d'un module (programme détail) */
export type APIStudentTrainingLesson = {
  id: string;
  title: string;
  kind: "video" | "reading" | "quiz" | "exercise" | "assignment" | "project";
  durationMinutes: number;
  sortOrder: number;
  isMandatory: boolean;
  brief: string | null;
  content: string | null;
  videoUrl: string | null;
  chapters: unknown | null;
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
  maxSeats: number;
  seatsRemaining: number;
  location: string;
  coverColor: string;
  startDate: string;
  endDate: string;
};

/** Infos d'inscription de l'étudiant courant pour cette formation (null si pas encore inscrit) */
export type APIStudentTrainingEnrollmentInfo = {
  id: string;
  status: string;
  progress: number;
  paymentStatus: string;
  amountPaid: number;
  accessUnlocked: boolean;
};

/**
 * Réponse complète de GET /api/v1/student/trainings/{id}
 * NB: la clé "data" ici contient les champs de la formation elle-même (pas un wrapper générique)
 */
export type APIStudentTrainingDetailResponse = {
  data: APIStudentTrainingDetail;
  enrollment: APIStudentTrainingEnrollmentInfo | null;
  contentLocked: boolean;
  modules: APIStudentTrainingModule[];
};
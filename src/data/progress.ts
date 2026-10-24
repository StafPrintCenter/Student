import type { TrainingEnrollmentStatus, TrainingPaymentStatus } from "@/data/trainings";
import type { CertificateEligibilityStatus } from "@/data/certificates";

/** Compteur de leçons : total / terminées / restantes */
export type APIProgressLessonsCount = {
  total: number;
  completed: number;
  remaining: number;
};

export type APIProgressAttendance = {
  /** Pourcentage de présence, null tant qu'aucune séance n'a été pointée */
  ratio: number | null;
  sessionsMarked: number;
  sessionsPresent: number;
};

/** Compteurs des réponses aux sessions */
export type APIProgressSessionsStats = {
  total: number;
  confirmed: number;
  declined: number;
  noResponse: number;
  /** Sessions à venir sans réponse de l'étudiant */
  upcomingNoResponse: number;
};

export type APIProgressItemSessions = APIProgressSessionsStats & {
  /** Sessions à venir (toutes réponses confondues) */
  upcoming: number;
};

export type APIProgressStats = {
  trainingsCount: number;
  inProgressCount: number;
  completedCount: number;
  certificatesCount: number;
  averageProgress: number;
  averageAttendance: number | null;
  averageScore: number | null;
  lessons: APIProgressLessonsCount;
  sessions: APIProgressSessionsStats;
  finance: {
    totalDue: number;
    totalPaid: number;
    totalRemaining: number;
  };
  lastActivityAt: string | null;
};

/** Un élément de GET /api/student/trainings/progress/list */
export type APIProgressItem = {
  enrollmentId: string;
  trainingId: string;
  trainingTitle: string;
  theme: string;
  coverColor: string;
  status: TrainingEnrollmentStatus;
  progress: number;
  lessons: APIProgressLessonsCount;
  mandatoryLessons: APIProgressLessonsCount;
  attendance: APIProgressAttendance;
  sessions: APIProgressItemSessions;
  averageScore: number | null;
  lastActivityAt: string | null;
  paymentStatus: TrainingPaymentStatus;
  certificateStatus: CertificateEligibilityStatus;
  enrolledAt: string;
  completedAt: string | null;
};

export type APIProgressResponse = {
  stats: APIProgressStats;
  data: APIProgressItem[];
};
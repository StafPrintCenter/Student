/** Aligné sur App\Enums\SessionModality (backend) */
export type SessionModality = "in_person" | "online";

export const sessionModalityLabels: Record<SessionModality, string> = {
  in_person: "Présentiel",
  online: "En ligne",
};

/** Aligné sur App\Enums\SessionResponse (backend) : réponse de l'étudiant à une session */
export type SessionResponse = "confirmed" | "declined";

export const sessionResponseMap: Record<SessionResponse, { label: string; className: string }> = {
  confirmed: { label: "Présence confirmée", className: "bg-success/15 text-success border-success/40" },
  declined: { label: "Absence signalée", className: "bg-destructive/10 text-destructive border-destructive/40" },
};

/** Aligné sur App\Enums\SessionStatus (backend) : l'étudiant ne reçoit que les sessions publiées */
export type SessionStatus = "published" | "suspended";

/** Session telle que renvoyée par la liste et par les détails */
export type APIStudentSession = {
  id: string;
  trainingId: string;
  trainingTitle: string;
  title: string;
  /** Facultative */
  description: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  modality: SessionModality;
  /** Renseigné en présentiel */
  location: string | null;
  /** Renseigné en ligne */
  meetingUrl: string | null;
  status: SessionStatus;
  isUpcoming: boolean;
  instructorId: string;
  instructorName: string;
  createdAt: string;
  /** null = pas encore répondu */
  myResponse: SessionResponse | null;
  respondedAt: string | null;
};

export type APISessionsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

/** Vue liste : paginée (meta présent). Vue calendrier (from + to) : fenêtre non paginée */
export type APISessionsListResponse = {
  data: APIStudentSession[];
  meta?: APISessionsMeta;
};

/** Réponse de PUT /api/student/trainings/sessions/{id}/respond */
export type APISessionResponseResult = {
  sessionId: string;
  response: SessionResponse;
  respondedAt: string;
};

/** Paramètres de GET /api/student/trainings/sessions/list */
export interface SessionsListParams {
  page?: number;
  perPage?: number;
  trainingId?: string;
  modality?: SessionModality;
  /** true = uniquement les sessions à venir (ne jamais envoyer false) */
  upcoming?: boolean;
  /** yyyy-MM-dd : avec `to`, active la vue calendrier (non paginée) */
  from?: string;
  to?: string;
  query?: string;
}

/** À venir d'abord (la plus proche en premier), puis les passées (la plus récente en premier) */
export function sortSessionsForDisplay(sessions: APIStudentSession[]): APIStudentSession[] {
  const time = (s: APIStudentSession) => new Date(s.startsAt).getTime();
  const upcoming = sessions.filter((s) => s.isUpcoming).sort((a, b) => time(a) - time(b));
  const past = sessions.filter((s) => !s.isUpcoming).sort((a, b) => time(b) - time(a));
  return [...upcoming, ...past];
}
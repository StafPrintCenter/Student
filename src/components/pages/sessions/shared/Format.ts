import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { sessionModalityLabels, type APIStudentSession } from "@/data/sessions";

export const formatSessionDay = (iso: string) => format(new Date(iso), "EEEE d MMMM yyyy", { locale: fr });
export const formatSessionTime = (iso: string) => format(new Date(iso), "HH:mm");

export const formatSessionTimeRange = (startsAt: string, endsAt: string) =>
  `${formatSessionTime(startsAt)} – ${formatSessionTime(endsAt)}`;

export function formatSessionDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
}

/** Clé yyyy-MM-dd d'un jour (fuseau du navigateur) : fenêtres de requête et regroupements */
export const sessionDayKey = (date: Date) => format(date, "yyyy-MM-dd");

/** Lieu en texte brut (sans lien), pour les lignes compactes */
export function sessionPlaceLabel(session: Pick<APIStudentSession, "modality" | "location">): string {
  if (session.modality === "online") return sessionModalityLabels.online;
  return session.location ?? sessionModalityLabels.in_person;
}
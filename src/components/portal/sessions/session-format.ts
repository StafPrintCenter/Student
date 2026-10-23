import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const formatSessionDay = (iso: string) => format(new Date(iso), "EEEE d MMMM yyyy", { locale: fr });

export const formatSessionTime = (iso: string) => format(new Date(iso), "HH:mm");

export const formatSessionTimeRange = (startsAt: string, endsAt: string) =>
  `${formatSessionTime(startsAt)} – ${formatSessionTime(endsAt)}`;

/** 115 -> "1 h 55", 60 -> "1 h", 30 -> "30 min" */
export function formatSessionDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
}
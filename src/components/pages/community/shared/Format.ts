import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const timeAgo = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });

export const fullDate = (iso: string) => format(new Date(iso), "d MMMM yyyy 'à' HH:mm", { locale: fr });

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}

/** Taille des pages : partagée par l'affichage et la recherche de commentaire, pour tomber sur la même page */
export const COMMENTS_PER_PAGE = 12;
export const REPLIES_PER_PAGE = 12;
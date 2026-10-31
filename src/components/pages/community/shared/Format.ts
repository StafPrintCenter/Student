import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const timeAgo = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });

export const fullDate = (iso: string) => format(new Date(iso), "d MMMM yyyy 'à' HH:mm", { locale: fr });

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}
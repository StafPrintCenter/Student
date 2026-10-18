import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, Clock, History, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { APILessonDetail } from "@/data/lesson";

const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)} min ${seconds % 60} s`;

type Fact = { key: string; icon: LucideIcon; text: string; className?: string };

export function LessonProgressInfo({ lesson }: { lesson: APILessonDetail }) {
  const { progress, kind } = lesson;
  if (progress.status === "not_started") return null;

  const facts: Fact[] = [];

  if (progress.completedAt) {
    facts.push({
      key: "done",
      icon: CheckCircle2,
      text: `Terminée le ${format(new Date(progress.completedAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}`,
      className: "text-success",
    });
  }
  if (progress.bestScore != null) {
    facts.push({ key: "score", icon: Trophy, text: `Meilleur score : ${progress.bestScore}%` });
  }
  // Le ratio n'a de sens que pour les vidéos (il vaut "0.00" sur les autres types, même terminés)
  if (kind === "video" && progress.watchedSeconds) {
    const ratio = progress.completionRatio != null ? ` (${Math.round(Number(progress.completionRatio))}%)` : "";
    facts.push({ key: "watched", icon: Clock, text: `Visionnée : ${formatDuration(progress.watchedSeconds)}${ratio}` });
  }
  if (progress.lastActivityAt) {
    facts.push({
      key: "last",
      icon: History,
      text: `Dernière activité ${formatDistanceToNow(new Date(progress.lastActivityAt), { addSuffix: true, locale: fr })}`,
    });
  }

  if (facts.length === 0) return null;

  return (
    <ul className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
      {facts.map(({ key, icon: Icon, text, className }) => (
        <li key={key} className={cn("flex items-center gap-2", className)}>
          <Icon className="h-3.5 w-3.5 shrink-0" /> {text}
        </li>
      ))}
    </ul>
  );
}
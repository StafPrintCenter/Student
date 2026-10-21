import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { BadgeCheck, BookOpen, CalendarCheck, GraduationCap, Trophy, TrendingUp } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/portal/progress/stat-card";
import type { APIProgressStats } from "@/data/progress";

const percent = (value: number | null) => (value == null ? "-" : `${value}%`);

export function ProgressStats({ stats }: { stats: APIProgressStats }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={GraduationCap}
          label="Formations"
          value={String(stats.trainingsCount)}
          hint={`${stats.inProgressCount} en cours · ${stats.completedCount} terminée${stats.completedCount > 1 ? "s" : ""}`}
        />
        <StatCard icon={TrendingUp} label="Progression moyenne" value={percent(stats.averageProgress)}>
          <Progress value={stats.averageProgress} className="h-1.5" />
        </StatCard>
        <StatCard
          icon={BookOpen}
          label="Leçons"
          value={`${stats.lessons.completed}/${stats.lessons.total}`}
          hint={`${stats.lessons.remaining} restante${stats.lessons.remaining > 1 ? "s" : ""}`}
        />
        <StatCard icon={CalendarCheck} label="Assiduité moyenne" value={percent(stats.averageAttendance)} />
        <StatCard icon={Trophy} label="Score moyen" value={percent(stats.averageScore)} />
        <StatCard
          icon={BadgeCheck}
          label="Certificats"
          value={String(stats.certificatesCount)}
          hint={stats.certificatesCount > 0 ? "Disponibles dans « Certificats »" : "Aucun certificat pour le moment"}
        />
      </div>

      {stats.lastActivityAt && (
        <p className="text-xs text-muted-foreground">
          Dernière activité {formatDistanceToNow(new Date(stats.lastActivityAt), { addSuffix: true, locale: fr })}
        </p>
      )}
    </div>
  );
}
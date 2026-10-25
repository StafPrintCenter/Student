import { BadgeCheck, BookOpen, CalendarCheck, LineChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/portal/progress/stat-card";
import { useStudentProgress } from "@/stores/useProgressStore";

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

export function DashboardStats() {
  const { stats, isLoading, isError, refetch } = useStudentProgress();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
        <span className="text-destructive">Impossible de charger vos statistiques.</span>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={LineChart}
        label="Progression globale"
        value={`${stats.averageProgress}%`}
        hint={`${stats.inProgressCount} en cours · ${plural(stats.completedCount, "terminée")}`}
      >
        <Progress value={stats.averageProgress} className="h-1.5" />
      </StatCard>
      <StatCard
        icon={BookOpen}
        label="Leçons terminées"
        value={`${stats.lessons.completed}/${stats.lessons.total}`}
        hint={plural(stats.lessons.remaining, "restante")}
      />
      <StatCard
        icon={CalendarCheck}
        label="Assiduité"
        value={stats.averageAttendance == null ? "—" : `${stats.averageAttendance}%`}
        hint="Taux de présence moyen"
      />
      <StatCard
        icon={BadgeCheck}
        label="Certificats obtenus"
        value={String(stats.certificatesCount)}
        hint={stats.certificatesCount > 0 ? "Consultables dans « Certificats »" : "Aucun pour le moment"}
      />
    </div>
  );
}
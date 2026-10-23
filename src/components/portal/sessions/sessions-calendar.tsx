import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarX, ChevronLeft, ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/portal/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDayPanel } from "@/components/portal/sessions/calendar-day-panel";
import { CalendarGrid, dayKey } from "@/components/portal/sessions/calendar-grid";
import { cn } from "@/lib/utils";
import { useSessionsList } from "@/stores/useSessionsStore";
import type { APIStudentSession } from "@/data/sessions";

export function SessionsCalendar() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(() => dayKey(new Date()));

  // On charge toute la grille affichée (de lundi à dimanche), jours des mois voisins compris
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const { items, isLoading, isFetching, isError, refetch } = useSessionsList({
    from: dayKey(gridStart),
    to: dayKey(gridEnd),
  });

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, APIStudentSession[]>();
    for (const s of items) {
      const key = dayKey(new Date(s.startsAt));
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    }
    return map;
  }, [items]);

  const goTo = (next: Date) => {
    setMonth(startOfMonth(next));
    setSelectedDay(null);
  };

  const goToday = () => {
    setMonth(startOfMonth(new Date()));
    setSelectedDay(dayKey(new Date()));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold capitalize">{format(month, "MMMM yyyy", { locale: fr })}</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={goToday}>
            Aujourd'hui
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            aria-label="Mois précédent"
            onClick={() => goTo(subMonths(month, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            aria-label="Mois suivant"
            onClick={() => goTo(addMonths(month, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <Legend dotClass="bg-success" label="Confirmée" />
        <Legend dotClass="bg-warning" label="À confirmer" />
        <Legend dotClass="bg-destructive" label="Déclinée" />
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError ? (
        <div className="space-y-4">
          <EmptyState
            icon={CalendarX}
            title="Impossible de charger le calendrier"
            description="Vérifiez votre connexion, puis réessayez."
          />
          <div className="flex justify-center">
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className={cn("transition-opacity", isFetching && "opacity-60")}>
            <CalendarGrid
              days={days}
              month={month}
              sessionsByDay={sessionsByDay}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </div>
          <CalendarDayPanel day={selectedDay} sessions={selectedDay ? (sessionsByDay.get(selectedDay) ?? []) : []} />
        </>
      )}
    </div>
  );
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", dotClass)} /> {label}
    </span>
  );
}
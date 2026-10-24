import { useMemo, useState } from "react";
import { endOfMonth, endOfWeek, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";

import { SelectedDayCard } from "@/components/portal/sessions/selected-day-card";
import { sessionDayKey } from "@/components/portal/sessions/session-format";
import { SessionsMonthPicker } from "@/components/portal/sessions/sessions-month-picker";
import { UpcomingSessionsCard } from "@/components/portal/sessions/upcoming-sessions-card";
import { useSessionsList } from "@/stores/useSessionsStore";

export function SessionsCalendar({ onShowList }: { onShowList?: () => void }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  // Aujourd'hui est sélectionné d'entrée : ses sessions s'affichent à droite
  const [selected, setSelected] = useState<Date | undefined>(() => new Date());

  // On charge toute la grille affichée (lundi → dimanche), jours des mois voisins compris
  const from = sessionDayKey(startOfWeek(startOfMonth(month), { weekStartsOn: 1 }));
  const to = sessionDayKey(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }));
  const { items, isLoading, isError, refetch } = useSessionsList({ from, to });

  // Jours marqués : une session à confirmer l'emporte sur les autres (un seul point par jour)
  const { toConfirmDays, otherDays } = useMemo(() => {
    const needsAnswer = (s: (typeof items)[number]) => s.isUpcoming && !s.myResponse;
    const toConfirmKeys = new Set(items.filter(needsAnswer).map((s) => sessionDayKey(new Date(s.startsAt))));

    return {
      toConfirmDays: items.filter((s) => toConfirmKeys.has(sessionDayKey(new Date(s.startsAt)))).map((s) => new Date(s.startsAt)),
      otherDays: items.filter((s) => !toConfirmKeys.has(sessionDayKey(new Date(s.startsAt)))).map((s) => new Date(s.startsAt)),
    };
  }, [items]);

  const daySessions = useMemo(() => {
    if (!selected) return [];
    return items
      .filter((s) => isSameDay(new Date(s.startsAt), selected))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [items, selected]);

  const goToMonth = (next: Date) => {
    const target = startOfMonth(next);
    setMonth(target);
    // Les sessions du jour sélectionné viennent de la fenêtre chargée : on ne garde que « aujourd'hui » dans le mois courant
    setSelected(isSameMonth(target, new Date()) ? new Date() : undefined);
  };

  const goToday = () => {
    setMonth(startOfMonth(new Date()));
    setSelected(new Date());
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <SessionsMonthPicker
        month={month}
        onMonthChange={goToMonth}
        selected={selected}
        onSelect={setSelected}
        toConfirmDays={toConfirmDays}
        otherDays={otherDays}
        onToday={goToday}
      />

      <div className="min-w-0 space-y-6">
        <SelectedDayCard
          day={selected}
          sessions={daySessions}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
        />
        <UpcomingSessionsCard onShowList={onShowList} />
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { endOfMonth, endOfWeek, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { SelectedDayCard, SessionsMonthPicker, UpcomingSessionsCard } from "@/components/pages/sessions/home";
import { sessionDayKey } from "@/components/pages/sessions/shared/Format";
import { useSessionsList } from "@/stores/useSessionsStore";

export function SessionsCalendar({ onShowList }: { onShowList?: () => void }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | undefined>(() => new Date());

  // On charge toute la grille affichée (lundi → dimanche), jours des mois voisins compris
  const from = sessionDayKey(startOfWeek(startOfMonth(month), { weekStartsOn: 1 }));
  const to = sessionDayKey(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }));
  const { items, isLoading, isError, refetch } = useSessionsList({ from, to });

  // Jours marqués : une session à confirmer l'emporte sur les autres (un seul point par jour)
  const { toConfirmDays, upcomingDays, pastDays } = useMemo(() => {
    const byDay = new Map<string, { date: Date; rank: number }>();

    for (const s of items) {
      const date = new Date(s.startsAt);
      const key = sessionDayKey(date);
      const rank = s.isUpcoming ? (s.myResponse ? 1 : 2) : 0;
      const current = byDay.get(key);
      if (!current || rank > current.rank) byDay.set(key, { date, rank });
    }

    const days = [...byDay.values()];
    return {
      toConfirmDays: days.filter((d) => d.rank === 2).map((d) => d.date),
      upcomingDays: days.filter((d) => d.rank === 1).map((d) => d.date),
      pastDays: days.filter((d) => d.rank === 0).map((d) => d.date),
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
        upcomingDays={upcomingDays}
        pastDays={pastDays}
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

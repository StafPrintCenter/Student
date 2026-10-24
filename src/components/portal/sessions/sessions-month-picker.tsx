import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Point sous le numéro du jour
const DOT =
  "relative after:absolute after:bottom-0.5 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full";

// Un jour ne porte qu'un seul point (priorité : à confirmer > à venir > passée).
// "à confirmer" retombe sur --amber tant que --warning n'est pas défini dans le CSS.
const MARKS = {
  toConfirm: {
    label: "À confirmer",
    day: `${DOT} after:bg-[var(--warning,var(--amber))]`,
    dot: "bg-[var(--warning,var(--amber))]",
  },
  upcoming: {
    label: "Session à venir",
    day: `${DOT} after:bg-info`,
    dot: "bg-info",
  },
  past: {
    label: "Session passée",
    day: `${DOT} after:bg-muted-foreground/50`,
    dot: "bg-muted-foreground/50",
  },
} as const;

interface SessionsMonthPickerProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selected: Date | undefined;
  onSelect: (day: Date | undefined) => void;
  /** Jours avec au moins une session à venir sans réponse */
  toConfirmDays: Date[];
  /** Autres jours avec une session à venir */
  upcomingDays: Date[];
  /** Jours où il n'y a que des sessions passées */
  pastDays: Date[];
  onToday: () => void;
}

export function SessionsMonthPicker({
  month,
  onMonthChange,
  selected,
  onSelect,
  toConfirmDays,
  upcomingDays,
  pastDays,
  onToday,
}: SessionsMonthPickerProps) {
  return (
    <Card className="h-fit">
      <CardContent className="space-y-3 p-4">
        <CalendarUI
          mode="single"
          month={month}
          onMonthChange={onMonthChange}
          selected={selected}
          onSelect={onSelect}
          locale={fr}
          modifiers={{
            sessionToConfirm: toConfirmDays,
            sessionUpcoming: upcomingDays,
            sessionPast: pastDays,
          }}
          modifiersClassNames={{
            sessionToConfirm: MARKS.toConfirm.day,
            sessionUpcoming: MARKS.upcoming.day,
            sessionPast: MARKS.past.day,
          }}
        />

        <div className="flex items-end justify-between gap-3 border-t pt-3">
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <LegendItem mark={MARKS.upcoming} />
            <LegendItem mark={MARKS.toConfirm} />
            <LegendItem mark={MARKS.past} />
          </div>
          <Button size="sm" variant="outline" onClick={onToday}>
            Aujourd'hui
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LegendItem({ mark }: { mark: (typeof MARKS)[keyof typeof MARKS] }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", mark.dot)} />
      {mark.label}
    </span>
  );
}
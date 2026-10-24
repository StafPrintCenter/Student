import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Point sous le numéro du jour
const DOT =
  "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full";

// Un jour ne porte qu'un seul de ces repères (priorité : à confirmer > à venir > passée)
const MARKS = {
  toConfirm: {
    label: "À confirmer",
    day: `${DOT} rounded-md ring-1 ring-inset ring-warning/70 after:bg-warning`,
    frame: "ring-1 ring-inset ring-warning/70",
    dot: "bg-warning",
  },
  upcoming: {
    label: "Session à venir",
    day: `${DOT} rounded-md ring-1 ring-inset ring-primary/50 after:bg-primary`,
    frame: "ring-1 ring-inset ring-primary/50",
    dot: "bg-primary",
  },
  past: {
    label: "Session passée",
    day: `${DOT} after:bg-muted-foreground/50`,
    frame: "",
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
      <span className={cn("relative h-4 w-4 rounded-md", mark.frame)}>
        <span className={cn("absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full", mark.dot)} />
      </span>
      {mark.label}
    </span>
  );
}
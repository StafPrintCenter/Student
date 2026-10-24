import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

// Petit point sous le numéro du jour, comme dans l'autre projet
const DOT =
  "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full";

interface SessionsMonthPickerProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selected: Date | undefined;
  onSelect: (day: Date | undefined) => void;
  /** Jours avec au moins une session à confirmer */
  toConfirmDays: Date[];
  /** Autres jours avec session */
  otherDays: Date[];
  onToday: () => void;
}

export function SessionsMonthPicker({
  month,
  onMonthChange,
  selected,
  onSelect,
  toConfirmDays,
  otherDays,
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
          modifiers={{ toConfirm: toConfirmDays, hasSession: otherDays }}
          modifiersClassNames={{
            hasSession: `${DOT} after:bg-primary`,
            toConfirm: `${DOT} after:bg-warning`,
          }}
        />

        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <div className="space-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Session
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" /> À confirmer
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={onToday}>
            Aujourd'hui
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
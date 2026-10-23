import { format, isSameMonth, isToday } from "date-fns";

import { formatSessionTime } from "@/components/portal/sessions/session-format";
import { cn } from "@/lib/utils";
import type { APIStudentSession } from "@/data/sessions";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export const dayKey = (date: Date) => format(date, "yyyy-MM-dd");

/** Couleur d'une session selon la réponse de l'étudiant */
function tone(session: APIStudentSession) {
  if (session.myResponse === "confirmed") return { pill: "bg-success/15 text-success", dot: "bg-success" };
  if (session.myResponse === "declined") {
    return { pill: "bg-destructive/10 text-destructive line-through", dot: "bg-destructive" };
  }
  return session.isUpcoming
    ? { pill: "bg-warning/15 text-warning-foreground", dot: "bg-warning" }
    : { pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/50" };
}

interface CalendarGridProps {
  days: Date[];
  month: Date;
  sessionsByDay: Map<string, APIStudentSession[]>;
  selectedDay: string | null;
  onSelectDay: (key: string) => void;
}

export function CalendarGrid({ days, month, sessionsByDay, selectedDay, onSelectDay }: CalendarGridProps) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = dayKey(day);
          const sessions = sessionsByDay.get(key) ?? [];
          const selected = key === selectedDay;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              aria-pressed={selected}
              className={cn(
                "flex min-h-16 flex-col items-start gap-1 rounded-md border p-1.5 text-left text-xs transition-colors hover:bg-muted/40 sm:min-h-24",
                isSameMonth(day, month) ? "bg-background" : "bg-muted/20 text-muted-foreground",
                selected ? "border-primary ring-1 ring-primary" : "border-border"
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full font-medium",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </span>

              {sessions.slice(0, 2).map((s) => (
                <span
                  key={s.id}
                  className={cn("hidden w-full truncate rounded px-1 py-0.5 text-[10px] sm:block", tone(s).pill)}
                >
                  {formatSessionTime(s.startsAt)} {s.title}
                </span>
              ))}
              {sessions.length > 2 && (
                <span className="hidden text-[10px] text-muted-foreground sm:block">+{sessions.length - 2} autre(s)</span>
              )}

              {sessions.length > 0 && (
                <span className="flex gap-0.5 sm:hidden">
                  {sessions.slice(0, 3).map((s) => (
                    <span key={s.id} className={cn("h-1.5 w-1.5 rounded-full", tone(s).dot)} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
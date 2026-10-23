import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

import { SessionCard } from "@/components/portal/sessions/session-card";
import type { APIStudentSession } from "@/data/sessions";

export function CalendarDayPanel({ day, sessions }: { day: string | null; sessions: APIStudentSession[] }) {
  if (!day) {
    return <p className="text-sm text-muted-foreground">Sélectionnez un jour pour voir ses sessions.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium capitalize">{format(parseISO(day), "EEEE d MMMM", { locale: fr })}</p>
      {sessions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          Aucune session ce jour-là.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} compact />
          ))}
        </div>
      )}
    </div>
  );
}
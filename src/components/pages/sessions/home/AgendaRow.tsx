import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, Video } from "lucide-react";
import { SessionDateBlock } from "@/components/portal/sessions/session-date-block";
import { SessionResponseBadge } from "@/components/portal/sessions/session-badges";
import { formatSessionTimeRange, sessionPlaceLabel } from "@/components/portal/sessions/session-format";
import type { APIStudentSession } from "@/data/sessions";

interface SessionAgendaRowProps {
  session: APIStudentSession;
  lead: "icon" | "date";
}

export function SessionAgendaRow({ session, lead }: SessionAgendaRowProps) {
  const Icon = session.modality === "online" ? Video : MapPin;

  return (
    <li>
      <Link
        to="/sessions/$id"
        params={{ id: session.id }}
        className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/40"
      >
        {lead === "date" ? (
          <SessionDateBlock startsAt={session.startsAt} size="sm" />
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-sm font-medium">{session.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {formatSessionTimeRange(session.startsAt, session.endsAt)} · {sessionPlaceLabel(session)}
          </p>
          <p className="truncate text-xs text-muted-foreground">{session.trainingTitle}</p>
        </div>

        <SessionResponseBadge response={session.myResponse} isUpcoming={session.isUpcoming} />
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}
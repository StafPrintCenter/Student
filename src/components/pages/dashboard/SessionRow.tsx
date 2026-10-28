import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SessionResponseBadge } from "@/components/pages/sessions/shared/Badges";
import { SessionDateBlock } from "@/components/pages/sessions/shared/session-date-block";
import { formatSessionTimeRange, sessionPlaceLabel } from "@/components/portal/sessions/session-format";
import type { APIStudentSession } from "@/data/sessions";

export function DashboardSessionRow({ session }: { session: APIStudentSession }) {
  return (
    <li>
      <Link
        to="/sessions/$id"
        params={{ id: session.id }}
        className="-mx-2 flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/40"
      >
        <SessionDateBlock startsAt={session.startsAt} size="sm" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium">{session.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            <span className="capitalize">{format(new Date(session.startsAt), "EEEE", { locale: fr })}</span> ·{" "}
            {formatSessionTimeRange(session.startsAt, session.endsAt)} · {sessionPlaceLabel(session)}
          </p>
          <SessionResponseBadge response={session.myResponse} isUpcoming={session.isUpcoming} />
        </div>
      </Link>
    </li>
  );
}
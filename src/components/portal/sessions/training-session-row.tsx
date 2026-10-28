import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { SessionDateBlock } from "@/components/portal/sessions/session-date-block";
import { SessionResponseBadge } from "@/components/portal/sessions/session-badges";
import { formatSessionTimeRange } from "@/components/portal/sessions/session-format";
import { sessionModalityLabels, type APIStudentSession } from "@/data/sessions";

/** Ligne compacte : mène au détail de la session dans le contexte de la formation */
export function TrainingSessionRow({ trainingId, session }: { trainingId: string; session: APIStudentSession }) {
  const place = session.modality === "online" ? sessionModalityLabels.online : (session.location ?? sessionModalityLabels.in_person);

  return (
    <li>
      <Link
        to="/trainings/$id/session/$sessionId"
        params={{ id: trainingId, sessionId: session.id }}
        className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/40"
      >
        <SessionDateBlock startsAt={session.startsAt} size="sm" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-sm font-medium">{session.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {formatSessionTimeRange(session.startsAt, session.endsAt)} · {place}
          </p>
        </div>
        <SessionResponseBadge response={session.myResponse} isUpcoming={session.isUpcoming} />
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}
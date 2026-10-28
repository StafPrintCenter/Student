import { Link } from "@tanstack/react-router";
import { Clock, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SessionDateBlock } from "@/components/portal/sessions/session-date-block";
import { SessionModalityBadge, SessionResponseBadge } from "@/components/pages/sessions/shared/Badges";
import { SessionPlace } from "@/components/portal/sessions/session-place";
import { SessionRespondButtons } from "@/components/portal/sessions/session-respond-buttons";
import { formatSessionDuration, formatSessionTimeRange } from "@/components/portal/sessions/session-format";
import type { APIStudentSession } from "@/data/sessions";

interface SessionCardProps {
  session: APIStudentSession;
  /** Sans description (utilisé dans le panneau du calendrier) */
  compact?: boolean;
}

export function SessionCard({ session, compact }: SessionCardProps) {
  return (
    <Card>
      <CardContent className="flex gap-4 p-4">
        <SessionDateBlock startsAt={session.startsAt} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to="/sessions/$id"
                params={{ id: session.id }}
                className="block truncate font-medium hover:underline"
              >
                {session.title}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{session.trainingTitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <SessionModalityBadge modality={session.modality} />
              <SessionResponseBadge response={session.myResponse} isUpcoming={session.isUpcoming} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatSessionTimeRange(session.startsAt, session.endsAt)} ({formatSessionDuration(session.durationMinutes)})
            </span>
            <SessionPlace session={session} />
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" /> {session.instructorName}
            </span>
          </div>

          {!compact && session.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{session.description}</p>
          )}

          {session.isUpcoming && <SessionRespondButtons sessionId={session.id} myResponse={session.myResponse} />}
        </div>
      </CardContent>
    </Card>
  );
}
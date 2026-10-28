import { Clock, Hourglass, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SessionModalityBadge, SessionResponseBadge } from "@/components/pages/sessions/shared/Badges";
import { SessionPlace } from "@/components/portal/sessions/session-place";
import { SessionRespondButtons } from "@/components/pages/sessions/shared/RespondButtons";
import { formatSessionDay, formatSessionDuration, formatSessionTimeRange } from "@/components/pages/sessions/shared/Format";
import type { APIStudentSession } from "@/data/sessions";

interface SessionTicketProps {
  session: APIStudentSession;
  accentColor?: string;
}

export function SessionTicket({ session, accentColor }: SessionTicketProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-3" style={{ background: accentColor ?? "var(--primary)" }} />

      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{session.trainingTitle}</p>
          <h1 className="font-display text-2xl leading-tight">{session.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <SessionModalityBadge modality={session.modality} />
            <SessionResponseBadge response={session.myResponse} isUpcoming={session.isUpcoming} />
          </div>
        </div>

        <div className="space-y-1 rounded-xl bg-muted/40 p-4">
          <p className="text-sm capitalize text-muted-foreground">{formatSessionDay(session.startsAt)}</p>
          <p className="font-display text-3xl font-semibold tabular-nums">
            {formatSessionTimeRange(session.startsAt, session.endsAt)}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hourglass className="h-3.5 w-3.5" /> {formatSessionDuration(session.durationMinutes)}
          </p>
        </div>

        <ul className="space-y-2.5 text-sm">
          <li className="flex items-center gap-2.5">
            <SessionPlace session={session} />
          </li>
          <li className="flex items-center gap-2.5 text-muted-foreground">
            <UserRound className="h-3.5 w-3.5 shrink-0" /> Animée par {session.instructorName}
          </li>
        </ul>

        {session.description && (
          <p className="whitespace-pre-line border-t border-dashed pt-4 text-sm text-muted-foreground">
            {session.description}
          </p>
        )}
      </CardContent>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-6 py-4">
        {session.isUpcoming ? (
          <>
            <p className="text-sm font-medium">Serez-vous présent ?</p>
            <SessionRespondButtons sessionId={session.id} myResponse={session.myResponse} />
          </>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> Session terminée
          </p>
        )}
      </div>
    </Card>
  );
}
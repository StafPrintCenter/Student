import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarX, Clock, Hourglass } from "lucide-react";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionDateBlock } from "@/components/pages/sessions/shared/session-date-block";
import { SessionModalityBadge, SessionResponseBadge } from "@/components/pages/sessions/shared/Badges";
import { SessionDetailsCard } from "@/components/pages/sessions/detail/Card";
import { SessionResponseCard } from "@/components/pages/sessions/detail/ResponseCard";
import { formatSessionDay, formatSessionDuration, formatSessionTimeRange } from "@/components/portal/sessions/session-format";
import { useSessionDetail } from "@/stores/useSessionsStore";

export const Route = createFileRoute("/_student/sessions/$id")({
  head: () => ({
    meta: [
      { title: "Session - STAF Student Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SessionDetail,
});

function BackButton() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/sessions">
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour aux sessions
      </Link>
    </Button>
  );
}

function SessionDetail() {
  const { id } = Route.useParams();
  const { item: session, isLoading } = useSessionDetail(id);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (!session) {
    return (
      <div className="space-y-6">
        <BackButton />
        <EmptyState
          icon={CalendarX}
          title="Session introuvable"
          description="Elle a peut-être été suspendue, ou le lien est incorrect."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-2 bg-linear-to-r from-primary to-primary/30" />
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start md:p-8">
          <SessionDateBlock startsAt={session.startsAt} size="lg" />
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <SessionModalityBadge modality={session.modality} />
              <SessionResponseBadge response={session.myResponse} isUpcoming={session.isUpcoming} />
              {!session.isUpcoming && (
                <Badge variant="outline" className="text-[10px]">
                  Terminée
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl leading-tight">{session.title}</h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="capitalize">{formatSessionDay(session.startsAt)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {formatSessionTimeRange(session.startsAt, session.endsAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Hourglass className="h-3.5 w-3.5" /> {formatSessionDuration(session.durationMinutes)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SessionDetailsCard session={session} />
        </div>
        <SessionResponseCard session={session} />
      </div>
    </div>
  );
}
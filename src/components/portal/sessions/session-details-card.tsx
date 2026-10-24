import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock, GraduationCap, Hourglass, MapPin, UserRound, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionPlace } from "@/components/portal/sessions/session-place";
import {
  formatSessionDay,
  formatSessionDuration,
  formatSessionTimeRange,
} from "@/components/portal/sessions/session-format";
import type { APIStudentSession } from "@/data/sessions";

export function SessionDetailsCard({ session }: { session: APIStudentSession }) {
  const online = session.modality === "online";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailRow icon={Calendar} label="Date">
            <span className="capitalize">{formatSessionDay(session.startsAt)}</span>
          </DetailRow>
          <DetailRow icon={Clock} label="Horaire">
            {formatSessionTimeRange(session.startsAt, session.endsAt)}
          </DetailRow>
          <DetailRow icon={Hourglass} label="Durée">
            {formatSessionDuration(session.durationMinutes)}
          </DetailRow>
          <DetailRow icon={online ? Video : MapPin} label={online ? "Connexion" : "Lieu"}>
            <SessionPlace session={session} showIcon={false} />
          </DetailRow>
          <DetailRow icon={UserRound} label="Formateur">
            {session.instructorName}
          </DetailRow>
          <DetailRow icon={GraduationCap} label="Formation">
            <Link to="/trainings/$id/mine" params={{ id: session.trainingId }} className="hover:underline">
              {session.trainingTitle}
            </Link>
          </DetailRow>
        </dl>

        {session.description && (
          <div className="space-y-1 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">Description</p>
            <p className="whitespace-pre-line text-sm">{session.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{children}</dd>
      </div>
    </div>
  );
}
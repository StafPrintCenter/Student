import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionResponseBadge } from "@/components/pages/sessions/shared/Badges";
import { SessionRespondButtons } from "@/components/temp/session-respond-buttons";
import type { APIStudentSession } from "@/data/sessions";

export function SessionResponseCard({ session }: { session: APIStudentSession }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Votre réponse</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Statut</span>
          <SessionResponseBadge response={session.myResponse} isUpcoming={session.isUpcoming} />
        </div>

        {session.respondedAt && (
          <p className="text-xs text-muted-foreground">
            Répondu le {format(new Date(session.respondedAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        )}

        {session.isUpcoming ? (
          <SessionRespondButtons
            sessionId={session.id}
            myResponse={session.myResponse}
            size="default"
            className="flex-col items-stretch [&>button]:w-full"
          />
        ) : (
          <p className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">Cette session est terminée.</p>
        )}
      </CardContent>
    </Card>
  );
}
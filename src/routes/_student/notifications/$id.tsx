import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, BellOff, CheckCircle2, ExternalLink, Info } from "lucide-react";

import { EmptyState } from "@/components/portal/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NotificationCategoryBadge,
  NotificationCategoryIcon,
} from "@/components/portal/notifications/notification-category";
import { resolveNotificationActionUrl } from "@/data/notifications";
import { useNotificationDetail } from "@/stores/useNotificationsStore";

export const Route = createFileRoute("/_student/notifications/$id")({
  head: () => ({
    meta: [
      { title: "Notification - STAF Student Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationDetail,
});

/** "contactMessageId" -> "Contact message id" */
function humanizeKey(key: string) {
  const spaced = key.replace(/([A-Z])/g, " $1").trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatValue(value: unknown) {
  return typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
}

function BackButton() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/notifications">
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Link>
    </Button>
  );
}

function NotificationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item, isLoading, isError } = useNotificationDetail(id);

  if (isLoading) return <Skeleton className="h-72 w-full" />;

  if (isError || !item) {
    return (
      <div className="space-y-6">
        <BackButton />
        <EmptyState
          icon={BellOff}
          title="Notification introuvable"
          description="Elle a peut-être été supprimée, ou le lien est incorrect."
        />
      </div>
    );
  }

  const action = item.actionUrl ? resolveNotificationActionUrl(item.actionUrl) : null;
  const extraData = item.data ? Object.entries(item.data) : [];

  return (
    <div className="space-y-6">
      <BackButton />

      <Card className="max-w-3xl">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <NotificationCategoryIcon category={item.category} className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <NotificationCategoryBadge category={item.category} />
                <span className="font-mono text-[11px] text-muted-foreground">{item.type}</span>
              </div>
              <h1 className="font-display text-2xl leading-tight">{item.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Reçue le {format(new Date(item.deliveredAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
            {item.readAt && (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Lue le {format(new Date(item.readAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <p className="whitespace-pre-line text-sm leading-relaxed">{item.body}</p>

          {extraData.length > 0 && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Info className="h-3.5 w-3.5" /> Informations associées
              </p>
              <dl className="space-y-1.5 text-sm">
                {extraData.map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">{humanizeKey(key)}</dt>
                    <dd className="break-all text-right font-mono text-xs">{formatValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {action && (
            <div className="border-t pt-4">
              {action.external ? (
                <Button asChild>
                  <a href={action.href} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1.5 h-4 w-4" /> Ouvrir le lien
                  </a>
                </Button>
              ) : (
                <Button onClick={() => navigate({ to: action.href as never })}>
                  <ExternalLink className="mr-1.5 h-4 w-4" /> Voir le détail
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
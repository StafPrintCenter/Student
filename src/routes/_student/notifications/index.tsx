import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Loader2, Settings } from "lucide-react";

import { PageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/portal/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem } from "@/components/portal/notifications/notification-item";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsList,
} from "@/stores/useNotificationsStore";

export const Route = createFileRoute("/_student/notifications/")({
  head: () => ({
    meta: [
      { title: "Notifications - STAF Student Portal" },
      { name: "description", content: "Vos notifications et leur historique." },
    ],
  }),
  component: NotificationsPage,
});

const PER_PAGE = 20;

function NotificationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { items, meta, isLoading, isError, refetch } = useNotificationsList({ page, perPage: PER_PAGE });
  const markAsRead = useMarkNotificationAsRead();
  const markAll = useMarkAllNotificationsAsRead();

  const unread = meta?.unreadTotal ?? 0;
  // Le backend ne documente pas de filtre : "Non lues" filtre la page affichée
  const visible = filter === "unread" ? items.filter((n) => !n.isRead) : items;

  const handleMarkAll = () =>
    markAll.mutate(undefined, {
      onSuccess: (message) => toast.success(message),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors du marquage"),
    });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Échanges"
        title="Notifications"
        description="Retrouvez vos alertes et messages, et choisissez comment les recevoir."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
          <TabsList>
            <TabsTrigger value="all">Toutes{meta ? ` (${meta.total})` : ""}</TabsTrigger>
            <TabsTrigger value="unread">Non lues{meta ? ` (${unread})` : ""}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/notifications/preferences">
              <Settings className="mr-1.5 h-3.5 w-3.5" /> Préférences
            </Link>
          </Button>
          <Button size="sm" disabled={unread === 0 || markAll.isPending} onClick={handleMarkAll}>
            {markAll.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            )}
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Bell}
          title="Impossible de charger les notifications"
          description="Vérifiez votre connexion, puis réessayez."
          action={<Button size="sm" onClick={() => refetch()}>Réessayer</Button>}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === "unread" ? "Aucune notification non lue sur cette page" : "Aucune notification"}
          description="Vos prochaines notifications apparaîtront ici."
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y">
            {visible.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                isMarking={markAsRead.isPending && markAsRead.variables === n.id}
                onMarkRead={() => markAsRead.mutate(n.id)}
                onOpen={() => navigate({ to: "/notifications/$id", params: { id: n.id } })}
              />
            ))}
          </ul>
        </Card>
      )}

      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {meta.currentPage} / {meta.lastPage}
          </span>
          <Button size="sm" variant="outline" disabled={page >= meta.lastPage} onClick={() => setPage((p) => p + 1)}>
            Suivant <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
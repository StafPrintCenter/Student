import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { BellOff, CheckCheck, Loader2, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/portal/notifications/notification-item";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsList,
} from "@/stores/useNotificationsStore";

export function NotificationsDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { items, meta, isLoading, isError } = useNotificationsList({ page: 1, perPage: 10 });
  const markAsRead = useMarkNotificationAsRead();
  const markAll = useMarkAllNotificationsAsRead();
  const unread = meta?.unreadTotal ?? 0;

  const handleMarkAll = () =>
    markAll.mutate(undefined, {
      onSuccess: (message) => toast.success(message),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors du marquage"),
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-y-auto p-0">
        <DialogHeader className="space-y-1 border-b p-5 pr-12">
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            {unread > 0 ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}` : "Vous êtes à jour"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 border-b px-5 py-2">
          <Button size="sm" variant="ghost" disabled={unread === 0 || markAll.isPending} onClick={handleMarkAll}>
            {markAll.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            )}
            Tout marquer comme lu
          </Button>
          <Button size="sm" variant="ghost" asChild onClick={onClose}>
            <Link to="/notifications/preferences">
              <Settings className="mr-1.5 h-3.5 w-3.5" /> Préférences
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-center text-sm text-destructive">Impossible de charger les notifications.</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-sm text-muted-foreground">
            <BellOff className="h-6 w-6 opacity-50" />
            Aucune notification pour le moment.
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                isMarking={markAsRead.isPending && markAsRead.variables === n.id}
                onMarkRead={() => markAsRead.mutate(n.id)}
                onOpen={() => {
                  onClose();
                  navigate({ to: "/notifications/$id", params: { id: n.id } });
                }}
              />
            ))}
          </ul>
        )}

        <div className="border-t p-3">
          <Button variant="outline" className="w-full" asChild onClick={onClose}>
            <Link to="/notifications">Voir toutes les notifications</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
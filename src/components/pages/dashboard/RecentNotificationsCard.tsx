import { Link, useNavigate } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/pages/notifications/shared";
import { useMarkAsRead, useNotificationsList } from "@/stores/useNotificationsStore";

export function RecentNotificationsCard() {
  const navigate = useNavigate();
  const { items, meta, isLoading, isError } = useNotificationsList({ page: 1, perPage: 5 });
  const markAsRead = useMarkAsRead();
  const unread = meta?.unreadTotal ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-primary" /> Notifications récentes
          {unread > 0 && (
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
              {unread} non lue{unread > 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/notifications">Voir tout</Link>
        </Button>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : isError ? (
          <p className="p-4 text-sm text-destructive">Impossible de charger vos notifications.</p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucune notification pour le moment.</p>
        ) : (
          <ul className="divide-y">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                isMarking={markAsRead.isPending && markAsRead.variables === n.id}
                onMarkRead={() => markAsRead.mutate(n.id)}
                onOpen={() => navigate({ to: "/notifications/$id", params: { id: n.id } })}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
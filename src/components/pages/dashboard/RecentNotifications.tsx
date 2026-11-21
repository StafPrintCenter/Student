import { Link, useNavigate } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/components/pages/notifications/shared";
import { useNotificationsList } from "@/stores/useNotificationsStore";

export function RecentNotificationsCard() {
  const navigate = useNavigate();
  const { items, meta, isLoading, isError } = useNotificationsList({ page: 1, perPage: 5 });
  const unread = meta?.unreadTotal ?? 0;

  return (
    <Card className="w-full max-w-full min-w-0 overflow-hidden">
      <CardHeader className="flex-col items-stretch gap-3 space-y-0 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <CardTitle className="flex min-w-0 flex-wrap items-center gap-2 text-base leading-snug">
          <Bell className="h-4 w-4 text-primary" /> Notifications récentes
          {unread > 0 && (
            <Badge variant="outline" className="max-w-full whitespace-normal border-primary/40 bg-primary/10 text-[10px] text-primary">
              {unread} non lue{unread > 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" className="w-full shrink-0 sm:w-auto" asChild>
          <Link to="/notifications">Voir tout</Link>
        </Button>
      </CardHeader>
      <CardContent className="w-full min-w-0 px-2 pb-2 sm:px-4 sm:pb-4">
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
          <ul className="w-full min-w-0 divide-y">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => navigate({ to: "/notifications/$id", params: { id: n.id } })}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
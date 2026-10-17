import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { APINotificationListItem } from "@/data/notifications";
import {
  NotificationCategoryBadge,
  NotificationCategoryIcon,
} from "@/components/portal/notifications/notification-category";

interface NotificationItemProps {
  notification: APINotificationListItem;
  onOpen: () => void;
  /** Marquer comme lue sans ouvrir la notification */
  onMarkRead?: () => void;
  isMarking?: boolean;
}

export function NotificationItem({ notification, onOpen, onMarkRead, isMarking }: NotificationItemProps) {
  return (
    <li className={cn("flex items-center gap-2 px-3 py-3 transition-colors hover:bg-muted/40", !notification.isRead && "bg-primary/5")}>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <span className="relative mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <NotificationCategoryIcon category={notification.category} className="h-4 w-4" />
          {!notification.isRead && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
          )}
        </span>
        <span className="min-w-0 space-y-1">
          <span className={cn("block truncate text-sm", notification.isRead ? "font-normal" : "font-semibold")}>
            {notification.title}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            <NotificationCategoryBadge category={notification.category} className="text-[10px]" />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.deliveredAt), { addSuffix: true, locale: fr })}
            </span>
          </span>
        </span>
      </button>

      {!notification.isRead && onMarkRead && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          title="Marquer comme lue"
          aria-label="Marquer comme lue"
          disabled={isMarking}
          onClick={onMarkRead}
        >
          {isMarking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
      )}
    </li>
  );
}
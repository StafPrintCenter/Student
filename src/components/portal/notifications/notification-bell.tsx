import { useState } from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationsDialog } from "@/components/portal/notifications/notifications-dialog";
import { useUnreadNotificationsCount } from "@/stores/useNotificationsStore";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { count } = useUnreadNotificationsCount();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        onClick={() => setOpen(true)}
        aria-label={count > 0 ? `Notifications (${count} non lues)` : "Notifications"}
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
      {/* Monté seulement à l'ouverture : la liste n'est chargée qu'à ce moment-là */}
      {open && <NotificationsDialog onClose={() => setOpen(false)} />}
    </>
  );
}
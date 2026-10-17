import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BellOff } from "lucide-react";

import { PageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/portal/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationPreferenceCard } from "@/components/portal/notifications/notification-preference-card";
import { useNotificationPreferences } from "@/stores/useNotificationsStore";

export const Route = createFileRoute("/_student/notifications/preferences")({
  head: () => ({
    meta: [
      { title: "Préférences de notification - STAF Student Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationPreferencesPage,
});

function NotificationPreferencesPage() {
  const { items, isLoading, isError } = useNotificationPreferences();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/notifications">
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour aux notifications
        </Link>
      </Button>

      <PageHeader
        eyebrow="Notifications"
        title="Préférences"
        description="Choisissez les catégories que vous souhaitez recevoir, et quand."
      />

      {isLoading ? (
        <div className="max-w-3xl space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={BellOff}
          title="Impossible de charger vos préférences"
          description="Vérifiez votre connexion, puis réessayez."
        />
      ) : (
        <div className="max-w-3xl space-y-4">
          {items.map((p) => (
            <NotificationPreferenceCard
              // la carte est remontée quand les valeurs serveur changent, pour resynchroniser son état local
              key={`${p.category}-${p.enabled}-${p.deliveryMode}-${(p.scheduleDays ?? []).join()}-${p.scheduleStartTime}-${p.scheduleEndTime}`}
              preference={p}
            />
          ))}
        </div>
      )}
    </div>
  );
}
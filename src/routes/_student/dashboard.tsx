import { createFileRoute } from "@tanstack/react-router";
import { ActionsRequiredCard, CurrentTrainingsCard, DashboardHeader, DashboardSessionsCard, DashboardStats, PaymentsOverviewCard, RecentNotificationsCard } from "@/components/pages/dashboard";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_student/dashboard")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Tableau de bord | ${SITE.name}` },
      { name: "description", content: "Consultez vos formations, les progrès des apprenants, les travaux à corriger et vos prochaines sessions." },
      { property: "og:title", content: `${SITE.tool} - Tableau de bord | ${SITE.name}` },
      { property: "og:description", content: "Retrouvez vos priorités pédagogiques et l'activité de vos formations." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      <ActionsRequiredCard />
      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CurrentTrainingsCard />
          <RecentNotificationsCard />
        </div>
        <div className="space-y-6">
          <DashboardSessionsCard />
          <PaymentsOverviewCard />
        </div>
      </div>
    </div>
  );
}

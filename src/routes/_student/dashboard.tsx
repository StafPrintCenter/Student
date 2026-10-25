import { createFileRoute } from "@tanstack/react-router";

import { ActionsRequiredCard } from "@/components/portal/dashboard/actions-required-card";
import { CurrentTrainingsCard } from "@/components/portal/dashboard/current-trainings-card";
import { DashboardHeader } from "@/components/portal/dashboard/dashboard-header";
import { DashboardSessionsCard } from "@/components/portal/dashboard/dashboard-sessions-card";
import { DashboardStats } from "@/components/portal/dashboard/dashboard-stats";
import { PaymentsOverviewCard } from "@/components/portal/dashboard/payments-overview-card";
import { RecentNotificationsCard } from "@/components/portal/dashboard/recent-notifications-card";

export const Route = createFileRoute("/_student/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord - STAF Student Portal" },
      { name: "description", content: "Vue d'ensemble de votre parcours d'apprentissage." },
      { property: "og:title", content: "Tableau de bord - STAF" },
      { property: "og:description", content: "Progression, règlements, sessions et certificats." },
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

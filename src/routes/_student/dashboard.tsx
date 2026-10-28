import { createFileRoute } from "@tanstack/react-router";
import { ActionsRequiredCard, CurrentTrainingsCard, DashboardHeader, DashboardSessionsCard, DashboardStats, PaymentsOverviewCard, RecentNotificationsCard } from "@/components/pages/dashboard";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_student/dashboard")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Tableau de bord et suivi de formation | ${SITE.name}` },
      { name: "description", content: `Retrouvez vos formations, suivez votre progression, réalisez vos exercices et consultez vos résultats depuis votre espace apprenant ${SITE.name}.` },
      { property: "og:title", content: `${SITE.tool} - Tableau de bord et suivi de formation | ${SITE.name}` },
      { property: "og:description", content: `Accédez à vos cours, suivez vos progrès et gérez votre parcours de formation depuis votre espace apprenant ${SITE.name}.` },
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

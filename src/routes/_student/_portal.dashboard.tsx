import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  CreditCard,
  GraduationCap,
  LineChart,
  Play,
  Wallet,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { PageHeader } from "@/components/portal/page-header";
import { StatCard } from "@/components/portal/stat-card";
import { EnrollmentBadge } from "@/components/portal/status-badges";
import { EmptyState } from "@/components/portal/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi } from "@/lib/api";
import { formatFCFA } from "@/lib/api/utils";

export const Route = createFileRoute("/_portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord - STAF Student Portal" },
      { name: "description", content: "Vue d'ensemble de votre parcours d'apprentissage." },
      { property: "og:title", content: "Tableau de bord - STAF" },
      { property: "og:description", content: "Progression, paiements, sessions et certificats." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.snapshot,
  });

  if (isLoading || !data) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Bonjour, ${data.student.first_name}`}
        title={
          <>
            Bienvenue dans votre atelier d'apprentissage.
          </>
        }
        description="Voici un aperçu de vos formations, de votre progression et de vos prochaines échéances."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/calendar"><CalendarDays className="h-4 w-4 mr-1.5" /> Emploi du temps</Link>
            </Button>
            <Button asChild>
              <Link to="/trainings">
                <Play className="h-4 w-4 mr-1.5" /> Continuer à apprendre
              </Link>
            </Button>
          </>
        }
      />

      {data.payment_reminders.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-foreground" /> Rappels de paiement
            </p>
            <ul className="space-y-2">
              {data.payment_reminders.map((r) => (
                <li key={r.enrollment_uuid} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.training_title}</p>
                    <p className="text-xs text-muted-foreground">{r.reason}</p>
                  </div>
                  <Link
                    to="/trainings/$id"
                    params={{ id: r.training_uuid }}
                    className="text-xs font-medium text-primary hover:underline shrink-0 tabular-nums"
                  >
                    {formatFCFA(r.amount_due)} →
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Progression globale"
          value={`${data.overall_progress}%`}
          hint="Toutes formations confondues"
          icon={LineChart}
          tone="primary"
        />
        <StatCard
          label="Assiduité"
          value={`${data.attendance_percentage}%`}
          hint="Taux de présence moyen"
          icon={GraduationCap}
          tone="success"
        />
        <StatCard
          label="Solde à régler"
          value={formatFCFA(data.outstanding_balance)}
          hint={data.outstanding_balance > 0 ? "Un ou plusieurs paiements en attente" : "À jour"}
          icon={Wallet}
          tone={data.outstanding_balance > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Certificats obtenus"
          value={data.certificates_earned}
          hint="Consultables dans « Certificats »"
          icon={BadgeCheck}
          tone="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Formations en cours</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/trainings">Voir tout <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.current_trainings.length === 0 && (
              <EmptyState
                icon={GraduationCap}
                title="Aucune formation active"
                description="Explorez notre catalogue pour vous inscrire à votre première formation."
                action={
                  <Button asChild variant="outline"><Link to="/trainings">Explorer</Link></Button>
                }
              />
            )}
            {data.current_trainings.map((e) => (
              <Link
                key={e.uuid}
                to="/trainings/$id"
                params={{ id: e.training.uuid }}
                className="block rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="hidden sm:block h-14 w-14 rounded-lg"
                    style={{ background: e.training.cover_color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium truncate">{e.training.title}</p>
                      <EnrollmentBadge status={e.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {e.training.theme} · {e.training.instructor} · {e.training.location}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={e.progress} className="h-2 flex-1" />
                      <span className="text-xs font-medium tabular-nums text-muted-foreground w-10 text-right">
                        {e.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Prochaines échéances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcoming_sessions.length === 0 && (
                <p className="text-sm text-muted-foreground">Rien de prévu prochainement.</p>
              )}
              {data.upcoming_sessions.map((e) => (
                <div key={e.uuid} className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(e.start), "EEEE d MMM · HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Paiements récents</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/payments">Détail</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.recent_payments.map((p) => (
                <div key={p.uuid} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{p.reference}</span>
                  </div>
                  <span className="tabular-nums font-medium">{formatFCFA(p.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notifications récentes
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/notifications">Voir tout</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {data.recent_notifications.map((n) => (
              <li key={n.uuid} className="py-3 flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 rounded-full ${n.read ? "bg-border" : "bg-primary"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-14 w-2/3" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

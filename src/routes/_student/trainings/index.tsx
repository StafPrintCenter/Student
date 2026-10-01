import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GraduationCap, Users, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { PageHeader } from "@/components/portal/page-header";
import { EmptyState } from "@/components/portal/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStudentTrainingsList, useTrainingsCatalog, useSubscribeToTraining } from "@/stores/useTrainingsStore";
import { trainingEnrollmentStatusMap, trainingPaymentStatusMap, type APIPublicTrainingCatalogItem } from "@/data/trainings";

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount)} FCFA`;
}

function StatusBadge({ status, map }: {
  status: string;
  map: Record<string, { label: string; className: string }>;
}) {
  const config = map[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border" };
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

export const Route = createFileRoute("/_student/trainings/")({
  head: () => ({
    meta: [
      { title: "Mes formations - STAF Student Portal" },
      { name: "description", content: "Toutes vos formations et le catalogue disponible." },
    ],
  }),
  component: TrainingsPage,
});

function TrainingsPage() {
  const [tab, setTab] = useState<"mine" | "catalog">("mine");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Formations"
        title="Mes formations"
        description="Suivez vos inscriptions actives et découvrez de nouvelles formations."
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as "mine" | "catalog")}>
        <TabsList>
          <TabsTrigger value="mine">Mes inscriptions</TabsTrigger>
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="mt-6">
          <MyEnrollments />
        </TabsContent>
        <TabsContent value="catalog" className="mt-6">
          <Catalog />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MyEnrollments() {
  const { items, isLoading } = useStudentTrainingsList();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-52" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Vous n'êtes inscrit à aucune formation"
        description="Consultez le catalogue pour choisir une formation."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((e) => (
        <Card
          key={e.enrollmentId}
          className="overflow-hidden border-3"
          style={{ borderTopColor: e.coverColor ?? "var(--border)" }}
        >
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{e.theme} · {e.level}</p>
                {/* Route privée : réservée aux formations où l'étudiant est inscrit */}
                <Link
                  to="/trainings/$id/mine"
                  params={{ id: e.trainingId }}
                  className="mt-0.5 block font-medium truncate hover:underline"
                >
                  {e.trainingTitle}
                </Link>
              </div>
              <StatusBadge status={e.status} map={trainingEnrollmentStatusMap} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {e.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {e.seatsRemaining}/{e.maxSeats} places
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {e.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> {format(new Date(e.enrolledAt), "d MMM yyyy hh:mm", { locale: fr })}
              </span>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progression</span>
                <span className="tabular-nums font-medium">{e.progress}%</span>
              </div>
              <Progress value={e.progress} className="h-2" />
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
              <StatusBadge status={e.paymentStatus} map={trainingPaymentStatusMap} />
              <Button size="sm" variant="ghost" asChild>
                <Link to="/trainings/$id/mine" params={{ id: e.trainingId }}>
                  Ouvrir <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Catalog() {
  const [search, setSearch] = useState("");
  const { items, isLoading } = useTrainingsCatalog({ perPage: 12, search: search || undefined });
  const { items: myEnrollments } = useStudentTrainingsList();
  const enrolledIds = useMemo(() => new Set(myEnrollments.map((e) => e.trainingId)), [myEnrollments]);

  const subscribeMutation = useSubscribeToTraining();

  const handleSubscribe = (t: APIPublicTrainingCatalogItem) => {
    subscribeMutation.mutate(t.id, {
      onSuccess: () => toast.success("Inscription enregistrée."),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de l'inscription"),
    });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Rechercher une formation…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => {
            const deadlinePassed = new Date(t.registrationDeadline) < new Date();
            const already = enrolledIds.has(t.id);
            const closed = t.enrollmentStatus !== "open" || deadlinePassed;
            const canEnroll = !already && !closed && (t.seatsRemaining > 0 || t.waitingListEnabled);
            const isSubmittingThis = subscribeMutation.isPending && subscribeMutation.variables === t.id;
            const cta = already
              ? "Déjà inscrit"
              : closed
                ? "Inscriptions fermées"
                : t.seatsRemaining <= 0
                  ? "Liste d'attente"
                  : "S'inscrire";
            return (
              <Card key={t.id} className="flex flex-col overflow-hidden">
                <div
                  className="h-24"
                  style={{
                    background: `linear-gradient(135deg, ${t.coverColor}, color-mix(in oklab, ${t.coverColor} 40%, transparent))`,
                  }}
                />
                <CardContent className="flex flex-1 flex-col space-y-3 p-5">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.theme} · {t.level}</p>
                    <Link to="/trainings/$id/catalogue" params={{ id: t.id }} className="mt-0.5 block font-medium hover:underline">
                      {t.title}
                    </Link>
                  </div>
                  <p className="line-clamp-2 flex-1 text-xs text-muted-foreground">{t.short}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {t.seatsRemaining}/{t.maxSeats}
                    </span>
                    <span>{t.duration}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Prix</p>
                      <p className="font-semibold tabular-nums">{formatFCFA(t.price)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={closed ? "secondary" : "default"}
                      disabled={!canEnroll || subscribeMutation.isPending}
                      onClick={() => handleSubscribe(t)}
                      className={cn(
                        already && "opacity-50",
                        closed && "bg-muted text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {isSubmittingThis ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Inscription…
                        </>
                      ) : (
                        cta
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

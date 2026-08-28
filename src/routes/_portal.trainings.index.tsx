import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { GraduationCap, Users, MapPin, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { PageHeader } from "@/components/portal/page-header";
import {
  EnrollmentBadge,
  PaymentBadge,
  CertificateBadge,
} from "@/components/portal/status-badges";
import { EmptyState } from "@/components/portal/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trainingApi } from "@/lib/api";
import { formatFCFA } from "@/lib/api/utils";

export const Route = createFileRoute("/_portal/trainings/")({
  head: () => ({
    meta: [
      { title: "Mes formations — STAF Student Portal" },
      { name: "description", content: "Toutes vos formations et le catalogue disponible." },
      { property: "og:title", content: "Mes formations — STAF" },
      { property: "og:description", content: "Vos formations et le catalogue." },
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
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
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
  const { data, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: trainingApi.myEnrollments,
  });

  if (isLoading) return <div className="grid gap-4 md:grid-cols-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-52"/>)}</div>;
  if (!data || data.length === 0)
    return (
      <EmptyState
        icon={GraduationCap}
        title="Vous n'êtes inscrit à aucune formation"
        description="Consultez le catalogue pour choisir une formation."
      />
    );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((e) => {
        const t = e.training;
        const remaining = t.maximum_students - t.current_students;
        return (
          <Card key={e.uuid} className="overflow-hidden">
            <div className="h-2" style={{ background: t.cover_color }} />
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t.theme} · {t.level}</p>
                  <Link to="/trainings/$id" params={{ id: t.uuid }} className="mt-0.5 block font-medium truncate hover:underline">
                    {t.title}
                  </Link>
                </div>
                <EnrollmentBadge status={e.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {t.duration}</span>
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {t.current_students}/{t.maximum_students}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {t.location}</span>
                <span className="truncate">Instructeur : {t.instructor}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="tabular-nums font-medium">{e.progress}%</span>
                </div>
                <Progress value={e.progress} className="h-2" />
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <PaymentBadge status={e.payment_status} />
                  <CertificateBadge status={e.certificate_status} />
                  {remaining > 0 && remaining <= 3 && (
                    <Badge variant="outline" className="text-[11px]">
                      {remaining} places restantes
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/trainings/$id" params={{ id: t.uuid }}>
                    Ouvrir <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Catalog() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["catalog", search],
    queryFn: () => trainingApi.list({ search }),
  });
  const qc = useQueryClient();
  const enrollments = useQuery({ queryKey: ["my-enrollments"], queryFn: trainingApi.myEnrollments });
  const enrolledIds = useMemo(
    () => new Set(enrollments.data?.map((e) => e.training_uuid) ?? []),
    [enrollments.data],
  );

  const enroll = useMutation({
    mutationFn: (id: string) => trainingApi.enroll(id),
    onSuccess: (res) => {
      toast.success(res.waiting_list ? "Inscrit sur la liste d'attente." : "Inscription enregistrée.");
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

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
          {Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-64"/>)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((t) => {
            const remaining = t.maximum_students - t.current_students;
            const deadlinePassed = new Date(t.registration_deadline) < new Date();
            const already = enrolledIds.has(t.uuid);
            const canEnroll = !already && !deadlinePassed && (remaining > 0 || t.waiting_list_enabled);
            const cta = already
              ? "Déjà inscrit"
              : deadlinePassed
              ? "Inscriptions fermées"
              : remaining <= 0
              ? "Liste d'attente"
              : "S'inscrire";
            return (
              <Card key={t.uuid} className="overflow-hidden flex flex-col">
                <div className="h-24" style={{ background: `linear-gradient(135deg, ${t.cover_color}, color-mix(in oklab, ${t.cover_color} 40%, transparent))` }} />
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.theme} · {t.level}</p>
                    <Link to="/trainings/$id" params={{ id: t.uuid }} className="mt-0.5 block font-medium hover:underline">
                      {t.title}
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {t.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{t.current_students}/{t.maximum_students}</span>
                    <span>{t.duration}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Prix</p>
                      <p className="font-semibold tabular-nums">{formatFCFA(t.price)}</p>
                    </div>
                    <Button size="sm" disabled={!canEnroll || enroll.isPending} onClick={() => enroll.mutate(t.uuid)}>
                      {cta}
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

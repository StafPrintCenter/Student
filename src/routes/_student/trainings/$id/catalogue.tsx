import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, CheckCircle2, Clock, GraduationCap, MapPin, Target, Users, Award } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  usePublicTrainingDetail,
  useStudentTrainingsList,
  useSubscribeToTraining,
} from "@/stores/useTrainingsStore";

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount)} FCFA`;
}

export const Route = createFileRoute("/_student/trainings/$id/catalogue")({
  head: () => ({
    meta: [
      { title: "Formation - Catalogue - STAF Student Portal" },
      { name: "description", content: "Fiche détaillée de la formation et inscription." },
    ],
  }),
  component: PublicTrainingDetail,
});

function PublicTrainingDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { item: training, isLoading } = usePublicTrainingDetail(id);
  const { items: myEnrollments } = useStudentTrainingsList();
  const isEnrolled = useMemo(() => myEnrollments.some((e) => e.trainingId === id), [myEnrollments, id]);

  const subscribeMutation = useSubscribeToTraining();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!training) return <p>Formation introuvable.</p>;

  const deadlinePassed = new Date(training.registrationDeadline) < new Date();
  const closed = training.enrollmentStatus !== "open" || deadlinePassed;
  const canEnroll = !isEnrolled && !closed && (training.seatsRemaining > 0 || training.waitingListEnabled);
  const ctaLabel = isEnrolled
    ? "Déjà inscrit"
    : closed
      ? "Inscriptions fermées"
      : training.seatsRemaining <= 0
        ? "Rejoindre la liste d'attente"
        : "S'inscrire";

  const handleSubscribe = () => {
    subscribeMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Inscription enregistrée.");
        qc.invalidateQueries({ queryKey: ["trainings"] });
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de l'inscription"),
    });
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/trainings"><ArrowLeft className="mr-1 h-4 w-4" /> Retour</Link>
      </Button>

      <Card className="overflow-hidden">
        {/* Bande de couleur — même style que les cards du catalogue */}
        <div
          className="h-24"
          style={{
            background: `linear-gradient(135deg, ${training.coverColor}, color-mix(in oklab, ${training.coverColor} 40%, transparent))`,
          }}
        />
        <CardContent className="space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">{training.theme}</Badge>
            <Badge variant="outline">{training.level}</Badge>
            <Badge variant="outline">{training.duration}</Badge>
            {isEnrolled && <Badge variant="outline" className="border-emerald/40 bg-emerald/15 text-emerald">Déjà inscrit</Badge>}
          </div>
          <h1 className="font-display text-3xl leading-tight md:text-4xl">{training.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{training.short}</p>
          <div className="grid gap-3 pt-2 text-sm sm:grid-cols-2 md:grid-cols-4">
            <Info icon={Clock} label="Durée" value={`${training.durationHours} h`} />
            <Info icon={Users} label="Places" value={`${training.seatsRemaining}/${training.maxSeats}`} />
            <Info icon={MapPin} label="Lieu" value={training.location} />
            <Info icon={Calendar} label="Démarre" value={format(new Date(training.startDate), "d MMM yyyy", { locale: fr })} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-primary" /> Objectifs pédagogiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {training.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-primary" /> Public visé & prérequis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{training.audience}</p>
              {training.prerequisites.length > 0 && (
                <ul className="list-inside list-disc space-y-1">
                  {training.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Programme</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue={training.program[0]?.title}>
                {training.program.map((section) => (
                  <AccordionItem key={section.title} value={section.title}>
                    <AccordionTrigger>{section.title}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {section.items.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4 text-primary" /> Certification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>{training.certification}</p>
              <p className="pt-1 text-xs">{training.schedule}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Inscription</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Prix</p>
                <p className="text-2xl font-semibold tabular-nums">{formatFCFA(training.price)}</p>
                <p className="text-xs text-muted-foreground">
                  Frais d'inscription {formatFCFA(training.registrationFee)}
                </p>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Places restantes</span>
                <span className="tabular-nums font-medium">{training.seatsRemaining}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Deadline</span>
                <span>{format(new Date(training.registrationDeadline), "d MMM yyyy", { locale: fr })}</span>
              </div>
              {isEnrolled ? (
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/trainings/$id/mine" params={{ id: training.id }}>Voir ma formation</Link>
                </Button>
              ) : (
                <Button className="w-full" disabled={!canEnroll || subscribeMutation.isPending} onClick={handleSubscribe}>
                  {subscribeMutation.isPending ? "Inscription…" : ctaLabel}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
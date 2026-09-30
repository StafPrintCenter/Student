import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowLeft, BookOpen, Calendar, CheckCircle2, Circle, Clock, Lock, MapPin, Users, Target,
  Trophy, ClipboardList, Sparkles, Video, GraduationCap, Award,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useStudentTrainingsList,
  usePublicTrainingDetail,
  useStudentTrainingDetail,
  useSubscribeToTraining,
} from "@/stores/useTrainingsStore";
import {
  trainingEnrollmentStatusMap,
  trainingPaymentStatusMap,
  type APIStudentTrainingLesson,
} from "@/data/trainings";

function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount)} FCFA`;
}

function StatusBadge({
  status,
  map,
}: {
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

export const Route = createFileRoute("/_student/trainings/$id")({
  head: () => ({
    meta: [
      { title: "Formation - STAF Student Portal" },
      { name: "description", content: "Détail de la formation, programme et progression." },
    ],
  }),
  component: TrainingDetail,
});

const kindIcons: Record<string, typeof Video> = {
  video: Video,
  reading: BookOpen,
  quiz: Trophy,
  exercise: ClipboardList,
  assignment: ClipboardList,
  project: Sparkles,
};

function TrainingDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { items: myEnrollments, isLoading: enrollmentsLoading } = useStudentTrainingsList();
  const myEnrollment = useMemo(
    () => myEnrollments.find((e) => e.trainingId === id),
    [myEnrollments, id]
  );
  const isEnrolled = !!myEnrollment;

  const { item: publicTraining, isLoading: publicLoading } = usePublicTrainingDetail(id);
  const { item: privateResponse, isLoading: privateLoading } = useStudentTrainingDetail(id, isEnrolled);

  const subscribeMutation = useSubscribeToTraining();
  const [activeLesson, setActiveLesson] = useState<APIStudentTrainingLesson | null>(null);

  const isLoading = publicLoading || enrollmentsLoading || (isEnrolled && privateLoading);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  // Formation réellement inexistante (catalogue public introuvable)
  if (!publicTraining) return <p>Formation introuvable.</p>;

  // Inscrit mais réponse privée pas encore arrivée (rare, cache en cours d'invalidation)
  if (isEnrolled && !privateResponse) {
    return <Skeleton className="h-96 w-full" />;
  }

  const enrollment = privateResponse?.enrollment ?? null;
  const contentLocked = privateResponse?.contentLocked ?? true;
  const modules = privateResponse?.modules ?? [];
  const unlocked = isEnrolled && !contentLocked;

  const deadlinePassed = new Date(publicTraining.registrationDeadline) < new Date();
  const closed = publicTraining.enrollmentStatus !== "open" || deadlinePassed;
  const canEnroll = !isEnrolled && !closed && (publicTraining.seatsRemaining > 0 || publicTraining.waitingListEnabled);
  const enrollCta = isEnrolled
    ? "Déjà inscrit"
    : closed
      ? "Inscriptions fermées"
      : publicTraining.seatsRemaining <= 0
        ? "Liste d'attente"
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

      <div className="overflow-hidden rounded-2xl border border-border">
        <div
          className="relative h-40 md:h-48"
          style={{
            background: `linear-gradient(135deg, ${publicTraining.coverColor}, color-mix(in oklab, ${publicTraining.coverColor} 30%, transparent))`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
        </div>
        <div className="space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">{publicTraining.theme}</Badge>
            <Badge variant="outline">{publicTraining.level}</Badge>
            <Badge variant="outline">{publicTraining.duration}</Badge>
            {isEnrolled && (
              <>
                {enrollment && <StatusBadge status={enrollment.status} map={trainingEnrollmentStatusMap} />}
                {contentLocked && (
                  <Badge className="border-warning/40 bg-warning/20 text-warning-foreground">
                    <Lock className="mr-1 h-3 w-3" /> Contenu verrouillé
                  </Badge>
                )}
              </>
            )}
          </div>
          <h1 className="font-display text-3xl leading-tight md:text-4xl">{publicTraining.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{publicTraining.short}</p>
          <div className="grid gap-3 pt-2 text-sm sm:grid-cols-2 md:grid-cols-4">
            <Info icon={Clock} label="Durée" value={`${publicTraining.durationHours} h`} />
            <Info icon={Users} label="Places" value={`${publicTraining.seatsRemaining}/${publicTraining.maxSeats}`} />
            <Info icon={MapPin} label="Lieu" value={publicTraining.location} />
            <Info icon={Calendar} label="Démarre" value={format(new Date(publicTraining.startDate), "d MMM yyyy", { locale: fr })} />
          </div>
        </div>
      </div>

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
                {publicTraining.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
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
              <p>{publicTraining.audience}</p>
              {publicTraining.prerequisites.length > 0 && (
                <ul className="list-inside list-disc space-y-1">
                  {publicTraining.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" /> Programme
              </CardTitle>
              {isEnrolled && (
                <p className="text-xs text-muted-foreground">
                  {modules.reduce((s, m) => s + m.lessons.length, 0)} leçons
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!isEnrolled && (
                <Accordion type="single" collapsible defaultValue={publicTraining.program[0]?.title}>
                  {publicTraining.program.map((section) => (
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
              )}

              {isEnrolled && (
                <>
                  {contentLocked && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm text-warning-foreground">
                      <Lock className="mt-0.5 h-4 w-4" />
                      <span>Le contenu se débloque une fois le paiement minimum effectué.</span>
                    </div>
                  )}
                  <Accordion type="multiple" defaultValue={modules[0] ? [modules[0].id] : []}>
                    {modules.map((m) => (
                      <AccordionItem key={m.id} value={m.id}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3 text-left">
                            <span className="font-medium">{m.title}</span>
                            <span className="text-xs text-muted-foreground">{m.lessons.length} leçons</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="divide-y">
                            {m.lessons.map((l) => (
                              <LessonRow key={l.id} lesson={l} locked={!unlocked} onOpen={() => unlocked && setActiveLesson(l)} />
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </>
              )}
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
              <p>{publicTraining.certification}</p>
              <p className="pt-1 text-xs">{publicTraining.schedule}</p>
            </CardContent>
          </Card>

          {isEnrolled ? (
            <Card>
              <CardHeader><CardTitle className="text-base">Votre inscription</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {enrollment && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      <StatusBadge status={enrollment.status} map={trainingEnrollmentStatusMap} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Paiement</span>
                      <StatusBadge status={enrollment.paymentStatus} map={trainingPaymentStatusMap} />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between">
                        <span>Progression</span>
                        <span className="tabular-nums font-medium">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                  </>
                )}
                <p className="pt-2 text-xs text-muted-foreground">
                  Fin prévue le {format(new Date(publicTraining.endDate), "d MMMM yyyy", { locale: fr })}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-base">Inscription</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Prix</p>
                  <p className="text-2xl font-semibold tabular-nums">{formatFCFA(publicTraining.price)}</p>
                  <p className="text-xs text-muted-foreground">
                    Frais d'inscription {formatFCFA(publicTraining.registrationFee)}
                  </p>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Places restantes</span>
                  <span className="tabular-nums font-medium">{publicTraining.seatsRemaining}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Deadline</span>
                  <span>{format(new Date(publicTraining.registrationDeadline), "d MMM yyyy", { locale: fr })}</span>
                </div>
                <Button className="w-full" disabled={!canEnroll || subscribeMutation.isPending} onClick={handleSubscribe}>
                  {subscribeMutation.isPending ? "Inscription…" : enrollCta}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {activeLesson && (
        <Dialog open={!!activeLesson} onOpenChange={(o) => !o && setActiveLesson(null)}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{activeLesson.kind}</Badge>
                <span className="text-xs text-muted-foreground">{activeLesson.durationMinutes} min</span>
              </div>
              <DialogTitle>{activeLesson.title}</DialogTitle>
              {activeLesson.brief && <DialogDescription>{activeLesson.brief}</DialogDescription>}
            </DialogHeader>
            {activeLesson.videoUrl && <video src={activeLesson.videoUrl} controls className="w-full rounded-lg" />}
            {activeLesson.content && (
              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
            )}
            <Button variant="outline" onClick={() => setActiveLesson(null)}>Fermer</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function LessonRow({ lesson, locked, onOpen }: { lesson: APIStudentTrainingLesson; locked: boolean; onOpen: () => void }) {
  const Icon = kindIcons[lesson.kind] ?? Circle;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        disabled={locked}
        className="-mx-2 flex w-full items-center justify-between rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-w-0 items-center gap-3">
          {locked ? <Lock className="h-4 w-4 shrink-0 text-muted-foreground" /> : <Icon className="h-4 w-4 shrink-0 text-primary" />}
          <span className="truncate">{lesson.title}</span>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{lesson.kind}</Badge>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{lesson.durationMinutes} min</span>
      </button>
    </li>
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

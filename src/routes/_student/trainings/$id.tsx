// src/routes/_student/trainings/$id.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft, BookOpen, Calendar, CheckCircle2, Circle, Clock, Lock, MapPin, Users, Target, Trophy, ClipboardList, Sparkles, Video,
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
import { EnrollmentBadge, PaymentBadge } from "@/components/portal/status-badges";
import { useStudentTrainingDetail, useSubscribeToTraining } from "@/stores/useTrainingsStore";
import type { APIStudentTrainingLesson } from "@/data/trainings";
import { toEnrollmentStatus, toPaymentStatus } from "@/lib/status-mappers";

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
  const { item: response, isLoading } = useStudentTrainingDetail(id);
  const subscribeMutation = useSubscribeToTraining();
  const [activeLesson, setActiveLesson] = useState<APIStudentTrainingLesson | null>(null);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!response) return <p>Formation introuvable.</p>;

  const { data: training, enrollment, contentLocked, modules } = response;
  const unlocked = !!enrollment && !contentLocked;
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

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
          style={{ background: `linear-gradient(135deg, ${training.coverColor}, color-mix(in oklab, ${training.coverColor} 30%, transparent))` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
        </div>
        <div className="space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">{training.theme}</Badge>
            <Badge variant="outline">{training.level}</Badge>
            <Badge variant="outline">{training.duration}</Badge>
            {enrollment && contentLocked && (
              <Badge className="border-warning/40 bg-warning/20 text-warning-foreground">
                <Lock className="mr-1 h-3 w-3" /> Contenu verrouillé
              </Badge>
            )}
          </div>
          <h1 className="font-display text-3xl leading-tight md:text-4xl">{training.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{training.short}</p>
          <div className="grid gap-3 pt-2 text-sm sm:grid-cols-2 md:grid-cols-4">
            <Info icon={Clock} label="Durée" value={`${training.durationHours} h`} />
            <Info icon={Users} label="Places" value={`${training.seatsRemaining}/${training.maxSeats}`} />
            <Info icon={MapPin} label="Lieu" value={training.location} />
            <Info icon={Calendar} label="Démarre" value={format(new Date(training.startDate), "d MMM yyyy", { locale: fr })} />
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
                {training.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" /> Programme
              </CardTitle>
              <p className="text-xs text-muted-foreground">{totalLessons} leçons</p>
            </CardHeader>
            <CardContent>
              {enrollment && contentLocked && (
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {enrollment ? (
            <Card>
              <CardHeader><CardTitle className="text-base">Votre inscription</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <EnrollmentBadge status={toEnrollmentStatus(enrollment.status)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paiement</span>
                  <PaymentBadge status={toPaymentStatus(enrollment.paymentStatus)} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <span>Progression</span>
                    <span className="tabular-nums font-medium">{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                </div>
                <p className="pt-2 text-xs text-muted-foreground">
                  Fin prévue le {format(new Date(training.endDate), "d MMMM yyyy", { locale: fr })}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-base">Inscription</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Places restantes</span>
                  <span className="tabular-nums font-medium">{training.seatsRemaining}</span>
                </div>
                <Button className="w-full" disabled={subscribeMutation.isPending} onClick={handleSubscribe}>
                  {subscribeMutation.isPending ? "Inscription…" : "S'inscrire"}
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

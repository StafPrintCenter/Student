import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, Clock, Lock, Unlock, MapPin, Users, Target, Wallet, Percent, AlertTriangle, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmptyState } from "@/components/portal/empty-state";
import { LessonDialog, kindIcons, Circle } from "@/components/portal/lesson-dialog";
import { CertificateAvailableBanner } from "@/components/portal/certificates/certificate-available-banner";
import { cn } from "@/lib/utils";
import { useStudentTrainingDetail } from "@/stores/useTrainingsStore";
import { trainingEnrollmentStatusMap, trainingPaymentStatusMap, lessonKindLabels, type APIStudentTrainingLesson } from "@/data/trainings";

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

export const Route = createFileRoute("/_student/trainings/$id/mine")({
  head: () => ({
    meta: [
      { title: "Formation - STAF Student Portal" },
      { name: "description", content: "Détail de votre formation, programme, paiement et progression." },
    ],
  }),
  component: TrainingDetail,
});

function TrainingDetail() {
  const { id } = Route.useParams();
  const { item: response, isLoading } = useStudentTrainingDetail(id);
  const [activeLesson, setActiveLesson] = useState<APIStudentTrainingLesson | null>(null);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (!response) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/trainings"><ArrowLeft className="mr-1 h-4 w-4" /> Retour</Link>
        </Button>
        <EmptyState
          icon={Lock}
          title="Vous n'êtes pas inscrit à cette formation"
          description="Consultez sa fiche dans le catalogue pour vous inscrire."
        />
      </div>
    );
  }

  const { data: training, enrollment, contentLocked, modules } = response;
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const accessMinRatioPercent = Math.round(parseFloat(training.accessMinRatio || "0") * 100);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/trainings"><ArrowLeft className="mr-1 h-4 w-4" /> Retour</Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div
          className="relative h-28"
          style={{ background: `linear-gradient(135deg, ${training.coverColor}, color-mix(in oklab, ${training.coverColor} 30%, transparent))` }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
        </div>
        <div className="space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">{training.theme}</Badge>
            <Badge variant="outline">{training.level}</Badge>
            <Badge variant="outline">{training.duration}</Badge>
            <StatusBadge status={enrollment.status} map={trainingEnrollmentStatusMap} />

            {contentLocked ? (
              <Badge className="border-warning/40 bg-warning/20 text-warning-foreground">
                <Lock className="mr-1 h-3 w-3" /> Contenu verrouillé
              </Badge>
            ) : (
              <Badge className="border-success/40 bg-success/20 text-success-foreground">
                <Unlock className="mr-1 h-3 w-3" /> Accès débloqué
              </Badge>
            )}
          </div>

          <h1 className="font-display text-3xl leading-tight md:text-4xl">{training.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{training.short}</p>

          <div className="grid gap-3 pt-2 text-sm sm:grid-cols-2 md:grid-cols-4">
            <Info icon={Clock} label="Durée" value={`${training.durationHours} h (${training.duration})`} />
            <Info icon={Users} label="Places restantes" value={`${training.seatsRemaining} / ${training.maxSeats}`} />
            <Info icon={MapPin} label="Lieu" value={training.location} />
            <Info icon={Calendar} label="Période" value={`${format(new Date(training.startDate), "d MMM", { locale: fr })} - ${format(new Date(training.endDate), "d MMM yyyy", { locale: fr })}`} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {contentLocked && (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="flex items-start gap-4 p-4 text-sm text-warning-foreground">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div className="space-y-1">
                  <p className="font-semibold">Accès au contenu restreint</p>
                  <p className="text-xs opacity-90">
                    Pour débloquer l'accès complet aux leçons et vidéos, vous devez régler le montant minimum d'acompte requis ({accessMinRatioPercent}% du total).
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
              <Accordion type="multiple" defaultValue={modules[0] ? [modules[0].id] : []}>
                {modules.map((m) => (
                  <AccordionItem key={m.id} value={m.id}>
                    <AccordionTrigger>
                      <div className="flex flex-col text-left sm:flex-row sm:items-center sm:gap-3">
                        <span className="font-medium">{m.title}</span>
                        <span className="text-xs text-muted-foreground">({m.lessons.length} leçons)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {m.description && (
                        <p className="mb-3 text-xs text-muted-foreground italic">{m.description}</p>
                      )}
                      {m.lessons.length > 0 ? (
                        <ul className="divide-y">
                          {m.lessons.map((l) => (
                            <LessonRow
                              key={l.id}
                              lesson={l}
                              locked={contentLocked}
                              onOpen={() => !contentLocked && setActiveLesson(l)}
                            />
                          ))}
                        </ul>
                      ) : (
                        <p className="py-2 text-xs text-muted-foreground italic">Aucune leçon dans ce module pour le moment.</p>
                      )}
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
              <CardTitle className="text-base">Votre Inscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Inscrit le</span>
                <span className="font-medium">
                  {format(new Date(enrollment.enrolledAt), "d MMM yyyy à HH:mm", { locale: fr })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut d'inscription</span>
                <StatusBadge status={enrollment.status} map={trainingEnrollmentStatusMap} />
              </div>

              <div className="pt-2 border-t">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progression du cours</span>
                  <span className="tabular-nums font-semibold">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" /> Statut Financier
              </CardTitle>
              <CardDescription className="text-xs">
                Détails du règlement et conditions d'accès
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut du paiement</span>
                <StatusBadge status={enrollment.paymentStatus} map={trainingPaymentStatusMap} />
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Wallet className="h-4 w-4" /> Montant réglé
                </span>
                <span className="font-semibold text-primary">
                  {enrollment.amountPaid.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Percent className="h-4 w-4" /> Seuil d'accès requis
                </span>
                <span className="font-medium">{accessMinRatioPercent}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Accès aux cours</span>
                <span className={cn("font-medium", enrollment.accessUnlocked ? "text-success" : "text-warning")}>
                  {enrollment.accessUnlocked ? "Débloqué" : "Verrouillé"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {activeLesson && <LessonDialog lesson={activeLesson} onClose={() => setActiveLesson(null)} />}
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
          {locked ? (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <Icon className="h-4 w-4 shrink-0 text-primary" />
          )}
          <span className="truncate">{lesson.title}</span>
          {/* avant : {lesson.kind} — maintenant le libellé mappé */}
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {lessonKindLabels[lesson.kind] ?? lesson.kind}
          </Badge>
          {lesson.isMandatory && (
            <Badge variant="outline" className="border-warning/40 bg-warning/10 text-[10px] text-warning-foreground">
              Obligatoire
            </Badge>
          )}
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {lesson.durationMinutes != null ? `${lesson.durationMinutes} min` : "—"}
        </span>
      </button>
    </li>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
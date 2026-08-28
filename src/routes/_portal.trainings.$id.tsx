import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  MapPin,
  Users,
  Target,
  Trophy,
  Wallet,
  Video,
  ClipboardList,
  Sparkles,
  PlayCircle,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trainingApi, learningApi, hasUnlockedAccess, minAccessAmount } from "@/lib/api";
import { formatFCFA } from "@/lib/api/utils";
import type { Enrollment, Lesson, Training } from "@/lib/api/types";
import { InstructorCard } from "@/components/portal/instructor-card";
import { PaymentDialog } from "@/components/portal/payment-dialog";
import { VideoPlayer } from "@/components/portal/video-player";
import { ExerciseRunner } from "@/components/portal/exercise-runner";
import { QuizRunner } from "@/components/portal/quiz-runner";

export const Route = createFileRoute("/_portal/trainings/$id")({
  head: () => ({
    meta: [
      { title: "Formation — STAF Student Portal" },
      { name: "description", content: "Détail de la formation, programme et progression." },
      { property: "og:title", content: "Formation — STAF" },
      { property: "og:description", content: "Programme, modules et progression." },
    ],
  }),
  component: TrainingDetail,
});

function TrainingDetail() {
  const { id } = Route.useParams();
  const { data: training, isLoading } = useQuery({
    queryKey: ["training", id],
    queryFn: () => trainingApi.detail(id),
  });
  const { data: enrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: trainingApi.myEnrollments,
  });
  const enrollment = enrollments?.find((e) => e.training_uuid === id);
  const [payOpen, setPayOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!training) return <p>Formation introuvable.</p>;

  const unlocked = enrollment ? hasUnlockedAccess(enrollment, training) : false;
  const totalLessons = training.modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = training.modules.reduce(
    (s, m) => s + m.lessons.filter((l) => l.completed).length,
    0,
  );

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/trainings"><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Link>
      </Button>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div
          className="h-40 md:h-48 relative"
          style={{
            background: `linear-gradient(135deg, ${training.cover_color}, color-mix(in oklab, ${training.cover_color} 30%, transparent))`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
        </div>
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">{training.theme}</Badge>
            <Badge variant="outline">{training.level}</Badge>
            <Badge variant="outline">{training.duration}</Badge>
            {enrollment && !unlocked && (
              <Badge className="bg-warning/20 text-warning-foreground border-warning/40">
                <Lock className="h-3 w-3 mr-1" /> Contenu verrouillé
              </Badge>
            )}
          </div>
          <h1 className="font-display text-3xl md:text-4xl leading-tight">{training.title}</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">{training.description}</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 pt-2 text-sm">
            <Info icon={Clock} label="Durée" value={`${training.duration_hours} h`} />
            <Info icon={Users} label="Places" value={`${training.current_students}/${training.maximum_students}`} />
            <Info icon={MapPin} label="Lieu" value={training.location} />
            <Info icon={Calendar} label="Démarre" value={format(new Date(training.start_date), "d MMM yyyy", { locale: fr })} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Objectives */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary"/>Objectifs pédagogiques</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {training.objectives.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Program — always visible outline; content gated */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Programme
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {unlocked ? `${completedLessons}/${totalLessons} leçons complétées` : `${totalLessons} leçons`}
              </p>
            </CardHeader>
            <CardContent>
              {!unlocked && (
                <div className="mb-4 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm text-warning-foreground flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5" />
                  <span>
                    Réglez au minimum <strong>{formatFCFA(minAccessAmount(training))}</strong>{" "}
                    ({enrollment ? formatFCFA(Math.max(0, minAccessAmount(training) - enrollment.amount_paid)) : formatFCFA(minAccessAmount(training))} restants){" "}
                    pour accéder aux leçons, quiz et exercices.
                  </span>
                </div>
              )}
              <Accordion type="multiple" defaultValue={[training.modules[0]?.uuid]}>
                {training.modules.map((m) => {
                  const done = m.lessons.filter((l) => l.completed).length;
                  return (
                    <AccordionItem key={m.uuid} value={m.uuid}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium">{m.title}</span>
                          <span className="text-xs text-muted-foreground">{done}/{m.lessons.length}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="divide-y">
                          {m.lessons.map((l) => (
                            <LessonRow
                              key={l.uuid}
                              lesson={l}
                              locked={!unlocked}
                              onOpen={() => unlocked ? setActiveLesson(l) : setPayOpen(true)}
                            />
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          {training.faq && training.faq.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">FAQ</CardTitle></CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {training.faq.map((f, i) => (
                    <AccordionItem key={i} value={`f${i}`}>
                      <AccordionTrigger>{f.q}</AccordionTrigger>
                      <AccordionContent>{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <InstructorCard instructor={training.instructor_profile} fallbackName={training.instructor} />

          {enrollment ? (
            <PaymentPanel training={training} enrollment={enrollment} onPay={() => setPayOpen(true)} />
          ) : (
            <EnrollmentCTA training={training} />
          )}

          {enrollment && (
            <Card>
              <CardHeader><CardTitle className="text-base">Votre progression</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="flex justify-between mb-1"><span>Avancement</span><span className="tabular-nums font-medium">{enrollment.progress}%</span></div>
                  <Progress value={enrollment.progress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span>Assiduité</span><span className="tabular-nums font-medium">{enrollment.attendance}%</span></div>
                  <Progress value={enrollment.attendance} className="h-2" />
                </div>
                <p className="pt-2 text-xs text-muted-foreground">
                  Fin prévue le {format(new Date(training.end_date), "d MMMM yyyy", { locale: fr })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {enrollment && (
        <PaymentDialog
          training={training}
          enrollment={enrollment}
          open={payOpen}
          onOpenChange={setPayOpen}
        />
      )}

      {activeLesson && (
        <LessonDialog
          training={training}
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
        />
      )}
    </div>
  );
}

function LessonRow({ lesson, locked, onOpen }: { lesson: Lesson; locked: boolean; onOpen: () => void }) {
  const kindIcon = {
    video: Video,
    reading: BookOpen,
    quiz: Trophy,
    exercise: ClipboardList,
    assignment: ClipboardList,
    project: Sparkles,
  }[lesson.kind];
  const Icon = kindIcon ?? Circle;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="w-full flex items-center justify-between py-2.5 text-sm text-left hover:bg-muted/40 rounded-md px-2 -mx-2 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {locked ? (
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : lesson.completed ? (
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          ) : (
            <Icon className="h-4 w-4 text-primary shrink-0" />
          )}
          <span className="truncate">{lesson.title}</span>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{lesson.kind}</Badge>
          {lesson.instructor_feedback?.validated && (
            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/40">validé</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {lesson.duration_minutes} min
          {typeof lesson.score === "number" && ` · ${lesson.score}%`}
        </span>
      </button>
    </li>
  );
}

function PaymentPanel({
  training, enrollment, onPay,
}: { training: Training; enrollment: Enrollment; onPay: () => void }) {
  const total = training.price + training.registration_fee;
  const paidRatio = Math.min(100, Math.round((enrollment.amount_paid / total) * 100));
  const unlocked = hasUnlockedAccess(enrollment, training);
  const toUnlock = Math.max(0, minAccessAmount(training) - enrollment.amount_paid);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" /> Paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Prix total</p>
          <p className="text-2xl font-semibold tabular-nums">{formatFCFA(total)}</p>
          <p className="text-xs text-muted-foreground">
            Formation {formatFCFA(training.price)} · Inscription {formatFCFA(training.registration_fee)}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Payé</span><span className="tabular-nums font-medium text-success">{formatFCFA(enrollment.amount_paid)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Restant</span><span className="tabular-nums font-medium">{formatFCFA(enrollment.amount_due)}</span></div>
          <Progress value={paidRatio} className="h-1.5" />
        </div>
        {!unlocked && (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-xs text-warning-foreground">
            <p className="font-medium">Débloquer le contenu</p>
            <p className="mt-1">
              Il vous reste <strong>{formatFCFA(toUnlock)}</strong> à régler pour atteindre le seuil du ¼ obligatoire.
            </p>
          </div>
        )}
        <Button className="w-full" onClick={onPay} disabled={enrollment.amount_due === 0}>
          {enrollment.amount_due === 0 ? "Solde réglé" : unlocked ? "Régler le solde" : "Débloquer maintenant"}
        </Button>
      </CardContent>
    </Card>
  );
}

function EnrollmentCTA({ training }: { training: Training }) {
  const remaining = training.maximum_students - training.current_students;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Inscription</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-xs text-muted-foreground">Prix</p>
        <p className="text-2xl font-semibold tabular-nums">{formatFCFA(training.price)}</p>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Places restantes</span><span className="tabular-nums font-medium">{Math.max(0, remaining)}</span></div>
        <div className="flex justify-between text-xs"><span className="text-muted-foreground">Deadline</span><span>{format(new Date(training.registration_deadline), "d MMM yyyy", { locale: fr })}</span></div>
        <Button className="w-full" asChild>
          <Link to="/trainings">Aller à l'inscription</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LessonDialog({
  training, lesson, onClose,
}: { training: Training; lesson: Lesson; onClose: () => void }) {
  const qc = useQueryClient();
  const [projectBody, setProjectBody] = useState("");

  const handleVideoDone = async () => {
    await learningApi.completeVideo(training.uuid, lesson.uuid);
    toast.success("Leçon marquée comme complétée.");
    qc.invalidateQueries({ queryKey: ["training", training.uuid] });
    qc.invalidateQueries({ queryKey: ["my-enrollments"] });
  };

  const submitProject = async () => {
    if (!projectBody.trim()) {
      toast.error("Décrivez votre livrable avant de soumettre.");
      return;
    }
    await learningApi.submitProject({ training_uuid: training.uuid, lesson_uuid: lesson.uuid, body: projectBody });
    toast.success("Livrable envoyé au formateur.");
    qc.invalidateQueries({ queryKey: ["training", training.uuid] });
    onClose();
  };

  return (
    <Dialog open={!!lesson} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{lesson.kind}</Badge>
            <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min</span>
          </div>
          <DialogTitle>{lesson.title}</DialogTitle>
          <DialogDescription>
            {lesson.kind === "video" && "Simulation de lecture vidéo — la leçon est marquée complétée à la fin."}
            {lesson.kind === "reading" && "Support de lecture pour cette leçon."}
            {lesson.kind === "quiz" && "Quiz chronométré — la meilleure note est conservée."}
            {lesson.kind === "exercise" && "Exercice non chronométré, évalué par votre formateur."}
            {(lesson.kind === "assignment" || lesson.kind === "project") && "Livrez votre travail à votre formateur."}
          </DialogDescription>
        </DialogHeader>

        {lesson.kind === "video" && <VideoPlayer lesson={lesson} onComplete={handleVideoDone} />}

        {lesson.kind === "reading" && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Support de la leçon « {lesson.title} ». Prenez le temps de parcourir ces notes,
              vous pouvez ensuite passer aux exercices associés dans le module.
            </p>
            <ul>
              <li>Objectifs clés de la leçon</li>
              <li>Points de vigilance</li>
              <li>Références complémentaires</li>
            </ul>
            <Button
              onClick={async () => {
                await learningApi.completeVideo(training.uuid, lesson.uuid);
                toast.success("Leçon marquée comme lue.");
                onClose();
              }}
            >
              <PlayCircle className="h-4 w-4 mr-1" /> Marquer comme lue
            </Button>
          </div>
        )}

        {lesson.kind === "exercise" && (
          <ExerciseRunner training_uuid={training.uuid} lesson={lesson} onFinished={onClose} />
        )}

        {lesson.kind === "quiz" && (
          <QuizRunner training_uuid={training.uuid} lesson={lesson} onFinished={onClose} />
        )}

        {(lesson.kind === "assignment" || lesson.kind === "project") && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
              <p className="flex items-center gap-2 font-medium">
                <ClipboardList className="h-4 w-4 text-primary" /> Consigne
              </p>
              <p className="text-muted-foreground">
                {lesson.brief ?? `Rendez un livrable en lien avec « ${lesson.title} ».`}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="submission">Votre livrable / lien</Label>
              <Textarea
                id="submission"
                rows={5}
                value={projectBody}
                onChange={(e) => setProjectBody(e.target.value)}
                placeholder="Collez le lien de votre travail (Figma, Drive…) ou rédigez votre réponse."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Fermer</Button>
              <Button onClick={submitProject}>Soumettre au formateur</Button>
            </DialogFooter>
          </div>
        )}

        {lesson.instructor_feedback && (
          <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Retour du formateur
              {lesson.instructor_feedback.validated ? (
                <Badge variant="outline" className="ml-1 bg-success/10 text-success border-success/40 text-[10px]">validé</Badge>
              ) : (
                <Badge variant="outline" className="ml-1 bg-warning/10 text-warning-foreground border-warning/40 text-[10px]">en attente</Badge>
              )}
            </p>
            <p>{lesson.instructor_feedback.comment}</p>
            {typeof lesson.instructor_feedback.note === "number" && (
              <p className="text-xs text-muted-foreground">Note : <strong className="text-foreground">{lesson.instructor_feedback.note}/100</strong></p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
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

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Circle, ClipboardList, ExternalLink, FileText, ListOrdered, Sparkles, Trophy, Video, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubmissionForm } from "@/components/portal/submission-form";
import { QuizRunner } from "@/components/portal/quiz/quiz-runner";
import { lessonKindLabels, type APIStudentTrainingLesson } from "@/data/trainings";
import { useMarkLessonProgress } from "@/stores/useLessonStore";

export const kindIcons: Record<string, typeof Video> = {
  video: Video,
  reading: BookOpen,
  quiz: Trophy,
  exercise: ClipboardList,
  assignment: ClipboardList,
  project: Sparkles,
};

type ReportProgress = (payload: { watched_seconds: number } | { completed: boolean }) => void;

/* ---- YouTube IFrame API : chargement global partagé ---- */

interface YoutubePlayerInstance {
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          width?: string;
          height?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: () => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => YoutubePlayerInstance;
      PlayerState: { PLAYING: number; ENDED: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

function extractYoutubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/embed/")[1] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

/* ---- Dialog ---- */

export function LessonDialog({ lesson, onClose }: { lesson: APIStudentTrainingLesson; onClose: () => void }) {
  const [justCompleted, setJustCompleted] = useState(false);
  const progressMutation = useMarkLessonProgress();

  const reportProgress: ReportProgress = (payload) => {
    progressMutation.mutate(
      { lessonId: lesson.id, payload: payload as any },
      {
        onSuccess: () => {
          setJustCompleted(true);
          toast.success("Leçon marquée comme terminée.");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement"),
      }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {lessonKindLabels[lesson.kind] ?? lesson.kind}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {lesson.durationMinutes != null ? `${lesson.durationMinutes} min` : "Durée non précisée"}
            </span>
            {lesson.isMandatory && (
              <Badge variant="outline" className="border-warning/40 bg-warning/10 text-[10px] text-warning-foreground">
                Obligatoire
              </Badge>
            )}
            {justCompleted && (
              <Badge className="border-success/40 bg-success/15 text-[10px] text-success">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Terminée
              </Badge>
            )}
          </div>
          <DialogTitle>{lesson.title}</DialogTitle>
          {lesson.brief && <DialogDescription>{lesson.brief}</DialogDescription>}
        </DialogHeader>

        <LessonBody lesson={lesson} onReportProgress={reportProgress} justCompleted={justCompleted} />

        <ChaptersList chapters={lesson.chapters} />

        <div className="flex items-center justify-between gap-2 pt-2">
          {lesson.kind === "reading" && (
            <Button
              size="sm"
              disabled={progressMutation.isPending || justCompleted}
              onClick={() => reportProgress({ completed: true })}
            >
              {justCompleted ? "Lecture validée" : progressMutation.isPending ? "Enregistrement…" : "Marquer comme lue"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---- Corps de la leçon selon son type ---- */

function LessonBody({
  lesson,
  onReportProgress,
  justCompleted,
}: {
  lesson: APIStudentTrainingLesson;
  onReportProgress: ReportProgress;
  justCompleted: boolean;
}) {
  switch (lesson.kind) {
    case "video":
      return <VideoBlock lesson={lesson} onReportProgress={onReportProgress} justCompleted={justCompleted} />;

    case "reading":
      return (
        <div className="space-y-4">
          <ContentBlock content={lesson.content} emptyMessage="Aucun support de lecture n'a encore été ajouté pour cette leçon." />
          <ExternalVideoLink url={lesson.videoUrl} />
        </div>
      );

    case "quiz":
      return (
        <div className="space-y-4">
          <ContentBlock content={lesson.content} />
          {lesson.quizId ? (
            <QuizRunner quizId={lesson.quizId} />
          ) : (
            <EmptyLessonContent icon={ClipboardList} message="Ce quiz n'est pas encore disponible." />
          )}
        </div>
      );

    case "exercise":
    case "assignment":
    case "project":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
            {lesson.kind === "exercise"
              ? "Exercice : déposez votre réponse ci-dessous."
              : "Travail à rendre : consultez la consigne, puis déposez votre réponse ci-dessous."}
          </div>
          <ContentBlock content={lesson.content} emptyMessage="Le contenu de cette activité n'a pas encore été renseigné." />
          <ExternalVideoLink url={lesson.videoUrl} />
          <SubmissionForm lessonId={lesson.id} kind={lesson.kind} />
        </div>
      );

    default:
      return <ContentBlock content={lesson.content} emptyMessage="Aucun contenu disponible pour cette leçon." />;
  }
}

/* ---- Vidéo : suivi réel de la lecture ---- */

function VideoBlock({
  lesson,
  onReportProgress,
  justCompleted,
}: {
  lesson: APIStudentTrainingLesson;
  onReportProgress: ReportProgress;
  justCompleted: boolean;
}) {
  if (!lesson.videoUrl) {
    return (
      <div className="space-y-4">
        <EmptyLessonContent icon={Video} message="Aucune vidéo n'a encore été ajoutée pour cette leçon." />
        <ContentBlock content={lesson.content} />
      </div>
    );
  }

  const youtubeId = extractYoutubeVideoId(lesson.videoUrl);

  if (isDirectVideoFile(lesson.videoUrl)) {
    return <DirectVideoPlayer lesson={lesson} onReportProgress={onReportProgress} />;
  }

  if (youtubeId) {
    return <YoutubePlayer videoId={youtubeId} lesson={lesson} onReportProgress={onReportProgress} justCompleted={justCompleted} />;
  }

  // Lien externe non reconnu : aucune position de lecture accessible, marquage manuel
  return (
    <div className="space-y-4">
      <ExternalVideoLink url={lesson.videoUrl} label="Ouvrir la vidéo" />
      <ContentBlock content={lesson.content} />
      <Button
        size="sm"
        variant="outline"
        disabled={justCompleted}
        onClick={() => onReportProgress({ watched_seconds: (lesson.durationMinutes ?? 0) * 60 || 1 })}
      >
        J'ai terminé cette vidéo
      </Button>
    </div>
  );
}

function DirectVideoPlayer({
  lesson,
  onReportProgress,
}: {
  lesson: APIStudentTrainingLesson;
  onReportProgress: ReportProgress;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportedRef = useRef(false);

  const reportOnce = (watchedSeconds: number) => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    onReportProgress({ watched_seconds: watchedSeconds });
  };

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        src={lesson.videoUrl!}
        controls
        className="w-full rounded-lg"
        onTimeUpdate={() => {
          const el = videoRef.current;
          if (!el || reportedRef.current || !el.duration) return;
          if (el.currentTime / el.duration >= 0.95) reportOnce(Math.round(el.currentTime));
        }}
        onEnded={() => reportOnce(Math.round(videoRef.current?.duration ?? (lesson.durationMinutes ?? 0) * 60))}
      />
      <ContentBlock content={lesson.content} />
    </div>
  );
}

function YoutubePlayer({
  videoId,
  lesson,
  onReportProgress,
  justCompleted,
}: {
  videoId: string;
  lesson: APIStudentTrainingLesson;
  onReportProgress: ReportProgress;
  justCompleted: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayerInstance | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reportedRef = useRef(false);
  const onReportRef = useRef(onReportProgress);
  onReportRef.current = onReportProgress;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let mount: HTMLDivElement | null = null;

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const reportOnce = (watchedSeconds: number) => {
      if (reportedRef.current) return;
      reportedRef.current = true;
      onReportRef.current({ watched_seconds: watchedSeconds });
    };

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;

      // L'API remplace l'élément reçu par une iframe : on lui donne un noeud créé à la main
      // pour ne pas perturber le DOM géré par React.
      mount = document.createElement("div");
      containerRef.current.appendChild(mount);

      playerRef.current = new window.YT.Player(mount, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { rel: 0 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            const states = window.YT!.PlayerState;
            if (e.data === states.PLAYING) {
              stopPolling();
              // Position réelle interrogée toutes les 2 s pendant la lecture
              pollRef.current = setInterval(() => {
                const player = playerRef.current;
                if (!player) return;
                const duration = player.getDuration();
                const current = player.getCurrentTime();
                if (duration > 0 && current / duration >= 0.95) {
                  reportOnce(Math.round(current));
                  stopPolling();
                }
              }, 2000);
            } else if (e.data === states.ENDED) {
              stopPolling();
              reportOnce(Math.round(playerRef.current?.getDuration() ?? (lesson.durationMinutes ?? 0) * 60));
            } else if (e.data === states.PAUSED) {
              stopPolling();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      stopPolling();
      playerRef.current?.destroy();
      playerRef.current = null;
      mount?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <div ref={containerRef} className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white/60">
            Chargement du lecteur…
          </div>
        )}
      </div>
      <ContentBlock content={lesson.content} />
      {!justCompleted && (
        <p className="text-xs text-muted-foreground">
          La leçon sera marquée terminée automatiquement une fois 95 % de la vidéo visionnés.
        </p>
      )}
    </div>
  );
}

/* ---- Blocs communs ---- */

function ExternalVideoLink({ url, label = "Voir la ressource vidéo associée" }: { url: string | null; label?: string }) {
  if (!url) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-primary underline underline-offset-4"
      >
        <ExternalLink className="h-3.5 w-3.5" /> {label}
      </a>
    </div>
  );
}

function ContentBlock({ content, emptyMessage }: { content: string | null; emptyMessage?: string }) {
  if (!content) {
    return emptyMessage ? <EmptyLessonContent icon={FileText} message={emptyMessage} /> : null;
  }
  return <div className="prose prose-sm max-w-none whitespace-pre-line dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />;
}

function ChaptersList({ chapters }: { chapters: string[] | null }) {
  if (!chapters || chapters.length === 0) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ListOrdered className="h-3.5 w-3.5" /> Chapitres
      </p>
      <ol className="list-inside list-decimal space-y-1 text-sm">
        {chapters.map((chapter, i) => (
          <li key={i}>{chapter}</li>
        ))}
      </ol>
    </div>
  );
}

function EmptyLessonContent({ icon: Icon, message }: { icon: typeof Video; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
      <Icon className="h-6 w-6 opacity-50" />
      <p>{message}</p>
    </div>
  );
}

// ré-exporté pour mine.tsx (icône par défaut dans LessonRow)
export { Circle };
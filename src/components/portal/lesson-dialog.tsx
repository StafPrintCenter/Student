import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen, Circle, ClipboardList, ListOrdered, Sparkles, Trophy, Video, FileText, CheckCircle2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { lessonKindLabels, TRACKABLE_LESSON_KINDS, type APIStudentTrainingLesson } from "@/data/trainings";
import { useMarkLessonProgress } from "@/stores/useLessonStore";

export const kindIcons: Record<string, typeof Video> = {
  video: Video,
  reading: BookOpen,
  quiz: Trophy,
  exercise: ClipboardList,
  assignment: ClipboardList,
  project: Sparkles,
};

/** Extrait l'id d'une vidéo YouTube depuis différents formats d'URL */
function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") videoId = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/")) return url;
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export function LessonDialog({ lesson, onClose }: { lesson: APIStudentTrainingLesson; onClose: () => void }) {
  const [justCompleted, setJustCompleted] = useState(false);
  const progressMutation = useMarkLessonProgress();
  const isTrackable = TRACKABLE_LESSON_KINDS.includes(lesson.kind);

  const reportProgress = (payload: { watched_seconds: number } | { completed: boolean }) => {
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

        <LessonBody lesson={lesson} onReportProgress={reportProgress} />

        <ChaptersList chapters={lesson.chapters} />

        <div className="flex items-center justify-between gap-2 pt-2">
          {isTrackable && lesson.kind === "reading" && (
            <Button
              size="sm"
              disabled={progressMutation.isPending || justCompleted}
              onClick={() => reportProgress({ completed: true })}
            >
              {justCompleted ? "Lecture validée" : progressMutation.isPending ? "Enregistrement…" : "Marquer comme lue"}
            </Button>
          )}
          {!isTrackable && (
            <p className="text-xs text-muted-foreground">
              Le suivi de ce type d'activité ({lessonKindLabels[lesson.kind]}) se fait via un autre module.
            </p>
          )}
          <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LessonBody({
  lesson,
  onReportProgress,
}: {
  lesson: APIStudentTrainingLesson;
  onReportProgress: (payload: { watched_seconds: number } | { completed: boolean }) => void;
}) {
  switch (lesson.kind) {
    case "video":
      return <VideoBlock lesson={lesson} onReportProgress={onReportProgress} />;
    case "reading":
      return <ContentBlock content={lesson.content} emptyMessage="Aucun support de lecture n'a encore été ajouté pour cette leçon." />;
    case "quiz":
    case "exercise":
    case "assignment":
    case "project":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
            {lesson.kind === "assignment" || lesson.kind === "project"
              ? "Travail à rendre — consultez la consigne ci-dessous."
              : "Évaluation liée à ce module."}
          </div>
          <ContentBlock content={lesson.content} emptyMessage="Le contenu de cette activité n'a pas encore été renseigné." />
        </div>
      );
    default:
      return <ContentBlock content={lesson.content} emptyMessage="Aucun contenu disponible pour cette leçon." />;
  }
}

function VideoBlock({
  lesson,
  onReportProgress,
}: {
  lesson: APIStudentTrainingLesson;
  onReportProgress: (payload: { watched_seconds: number } | { completed: boolean }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportedRef = useRef(false);

  if (!lesson.videoUrl) {
    return <EmptyLessonContent icon={Video} message="Aucune vidéo n'a encore été ajoutée pour cette leçon." />;
  }

  const youtubeEmbed = getYoutubeEmbedUrl(lesson.videoUrl);
  const isDirectFile = isDirectVideoFile(lesson.videoUrl);

  const reportOnce = (watchedSeconds: number) => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    onReportProgress({ watched_seconds: watchedSeconds });
  };

  if (isDirectFile) {
    // Lecture native : suivi réel du temps regardé via l'élément <video>
    return (
      <div className="space-y-4">
        <video
          ref={videoRef}
          src={lesson.videoUrl}
          controls
          className="w-full rounded-lg"
          onTimeUpdate={() => {
            const el = videoRef.current;
            if (!el || reportedRef.current) return;
            const totalSeconds = (lesson.durationMinutes ?? 0) * 60;
            if (totalSeconds > 0 && el.currentTime / totalSeconds >= 0.95) {
              reportOnce(Math.round(el.currentTime));
            }
          }}
          onEnded={() => reportOnce(Math.round(videoRef.current?.currentTime ?? (lesson.durationMinutes ?? 0) * 60))}
        />
        <ContentBlock content={lesson.content} />
      </div>
    );
  }

  // YouTube ou autre lien externe : pas d'accès à la position de lecture réelle depuis ici,
  // donc marquage manuel plutôt que de simuler un suivi précis.
  return (
    <div className="space-y-4">
      {youtubeEmbed ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            src={youtubeEmbed}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <p className="mb-2 text-muted-foreground">Cette vidéo est hébergée sur un lien externe :</p>
          <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-4">
            Ouvrir la vidéo
          </a>
        </div>
      )}
      <ContentBlock content={lesson.content} />
      <Button
        size="sm"
        variant="outline"
        disabled={reportedRef.current}
        onClick={() => reportOnce((lesson.durationMinutes ?? 0) * 60 || 1)}
      >
        J'ai terminé cette vidéo
      </Button>
    </div>
  );
}

function ContentBlock({ content, emptyMessage }: { content: string | null; emptyMessage?: string }) {
  if (!content) {
    return emptyMessage ? <EmptyLessonContent icon={FileText} message={emptyMessage} /> : null;
  }
  return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />;
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

export { Circle };
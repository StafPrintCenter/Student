import { useRef } from "react";
import { Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContentBlock, EmptyLessonContent, ExternalVideoLink } from "@/components/pages/trainings/detail/mine/Lesson";
import { YoutubePlayer } from "@/components/portal/lesson/youtube-player";
import { extractYoutubeVideoId, isDirectVideoFile } from "@/components/portal/lesson/video-utils";
import type { APILessonDetail, LessonProgressPayload } from "@/data/lesson";

interface VideoBlockProps {
  lesson: APILessonDetail;
  /** Absent quand la progression n'est pas suivie */
  onReportProgress?: (payload: LessonProgressPayload) => void;
  isReporting: boolean;
}

export function VideoBlock({ lesson, onReportProgress, isReporting }: VideoBlockProps) {
  if (!lesson.videoUrl) {
    return (
      <div className="space-y-4">
        <EmptyLessonContent icon={Video} message="Aucune vidéo n'a encore été ajoutée pour cette leçon." />
        <ContentBlock content={lesson.content} />
      </div>
    );
  }

  if (isDirectVideoFile(lesson.videoUrl)) {
    return <DirectVideoPlayer lesson={lesson} onReportProgress={onReportProgress} />;
  }

  const youtubeId = extractYoutubeVideoId(lesson.videoUrl);
  if (youtubeId) {
    return <YoutubePlayer videoId={youtubeId} lesson={lesson} onReportProgress={onReportProgress} />;
  }

  // Lien externe non reconnu : aucune position de lecture accessible, marquage manuel
  return (
    <div className="space-y-4">
      <ExternalVideoLink url={lesson.videoUrl} label="Ouvrir la vidéo" />
      <ContentBlock content={lesson.content} />
      {onReportProgress && (
        <Button
          size="sm"
          variant="outline"
          disabled={isReporting}
          onClick={() => onReportProgress({ watched_seconds: (lesson.durationMinutes ?? 0) * 60 || 1 })}
        >
          J'ai terminé cette vidéo
        </Button>
      )}
    </div>
  );
}

function DirectVideoPlayer({
  lesson,
  onReportProgress,
}: {
  lesson: APILessonDetail;
  onReportProgress?: (payload: LessonProgressPayload) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportedRef = useRef(false);

  const reportOnce = (watchedSeconds: number) => {
    if (!onReportProgress || reportedRef.current) return;
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
          if (!el || !el.duration) return;
          if (el.currentTime / el.duration >= 0.95) reportOnce(Math.round(el.currentTime));
        }}
        onEnded={() => reportOnce(Math.round(videoRef.current?.duration ?? (lesson.durationMinutes ?? 0) * 60))}
      />
      <ContentBlock content={lesson.content} />
    </div>
  );
}
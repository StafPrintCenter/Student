import { useEffect, useRef, useState } from "react";

import { ContentBlock } from "@/components/pages/trainings/detail/mine/Lesson/Blocks";
import { loadYoutubeIframeApi, type YoutubePlayerInstance } from "@/components/portal/lesson/video-utils";
import type { APILessonDetail, LessonProgressPayload } from "@/data/lesson";

interface YoutubePlayerProps {
  videoId: string;
  lesson: APILessonDetail;
  /** Absent quand la progression n'est pas suivie (leçon déjà terminée ou marquage indisponible) */
  onReportProgress?: (payload: LessonProgressPayload) => void;
}

export function YoutubePlayer({ videoId, lesson, onReportProgress }: YoutubePlayerProps) {
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
      const report = onReportRef.current;
      if (!report || reportedRef.current) return;
      reportedRef.current = true;
      report({ watched_seconds: watchedSeconds });
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
              if (!onReportRef.current) return;
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
      {onReportProgress && (
        <p className="text-xs text-muted-foreground">
          La leçon sera marquée terminée automatiquement une fois 95 % de la vidéo visionnés.
        </p>
      )}
    </div>
  );
}
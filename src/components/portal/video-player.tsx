import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/api/types";

interface Props {
  lesson: Lesson;
  onComplete: () => void;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ lesson, onComplete }: Props) {
  const total = Math.max(60, lesson.duration_minutes * 60);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [completed, setCompleted] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const step = (t: number) => {
      const dt = (t - last.current) / 1000;
      last.current = t;
      setCurrent((c) => {
        const next = Math.min(total, c + dt * speed * 8); // 8x realtime for simulation
        if (next >= total) {
          setPlaying(false);
          if (!completed) {
            setCompleted(true);
            onComplete();
          }
        }
        return next;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, speed, total, onComplete, completed]);

  const progress = (current / total) * 100;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 aspect-video">
        {/* Simulated stage */}
        <div className="absolute inset-0 grid place-items-center text-slate-100">
          <div className="text-center space-y-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">STAF · Vidéo</p>
            <p className="font-display text-2xl">{lesson.title}</p>
            <p className="text-xs text-slate-400">Simulation de lecture — {fmt(total)}</p>
          </div>
        </div>
        {/* Animated pulse */}
        <div
          className={cn(
            "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]",
            playing && "animate-pulse",
          )}
        />
        {/* Overlay play */}
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 grid place-items-center bg-black/30 text-white transition-colors hover:bg-black/40"
            aria-label="Lecture"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl">
              <Play className="h-6 w-6 ml-0.5" />
            </span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
          {lesson.chapters?.map((c) => (
            <div
              key={c.at}
              title={c.label}
              className="absolute top-0 h-full w-0.5 bg-background/80"
              style={{ left: `${(c.at / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Button size="icon" variant="secondary" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => { setCurrent(0); setCompleted(false); }} aria-label="Recommencer">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <span className="tabular-nums text-muted-foreground">
            {fmt(current)} / {fmt(total)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1 text-xs">
              <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
              {[1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "rounded px-1.5 py-0.5 tabular-nums",
                    speed === s ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground",
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
        {lesson.chapters && lesson.chapters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {lesson.chapters.map((c) => (
              <button
                key={c.at}
                onClick={() => setCurrent(c.at)}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {fmt(c.at)} · {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

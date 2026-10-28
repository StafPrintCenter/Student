import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Trophy, History, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { learningApi } from "@/lib/api";
import type { Lesson } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { QuestionBlock } from "../temp/exercise-runner";

interface Props {
  training_uuid: string;
  lesson: Lesson;
  onFinished: () => void;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

export function QuizRunner({ training_uuid, lesson, onFinished }: Props) {
  const questions = lesson.questions ?? [];
  const totalTime = lesson.quiz_time_limit_sec ?? 8 * 60;
  const qc = useQueryClient();

  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [answers, setAnswers] = useState<number[][]>(questions.map(() => []));
  const [remaining, setRemaining] = useState(totalTime);
  const [result, setResult] = useState<{ score: number; best: number; auto: boolean } | null>(null);
  const startedAt = useRef<number>(0);

  const attempts = useQuery({
    queryKey: ["quiz-attempts", lesson.uuid],
    queryFn: () => learningApi.attempts(lesson.uuid),
  });

  const submit = useMutation({
    mutationFn: (auto: boolean) =>
      learningApi.submitQuiz({
        training_uuid,
        lesson_uuid: lesson.uuid,
        answers,
        duration_sec: Math.round((Date.now() - startedAt.current) / 1000),
        auto_submitted: auto,
      }),
    onSuccess: (res, auto) => {
      setResult({ score: res.attempt.score, best: res.best, auto });
      setPhase("done");
      toast.success(auto ? "Temps écoulé - quiz envoyé." : `Quiz soumis - ${res.attempt.score}%`);
      qc.invalidateQueries({ queryKey: ["training", training_uuid] });
      qc.invalidateQueries({ queryKey: ["quiz-attempts", lesson.uuid] });
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });

  // Timer
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          submit.mutate(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Warn on close while running
  useEffect(() => {
    if (phase !== "running") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  const start = () => {
    startedAt.current = Date.now();
    setRemaining(totalTime);
    setAnswers(questions.map(() => []));
    setResult(null);
    setPhase("running");
  };

  const toggle = (qi: number, choice: number, multi: boolean) => {
    setAnswers((prev) => {
      const next = [...prev];
      if (!multi) next[qi] = [choice];
      else {
        const set = new Set(prev[qi] ?? []);
        set.has(choice) ? set.delete(choice) : set.add(choice);
        next[qi] = Array.from(set);
      }
      return next;
    });
  };

  if (phase === "intro") {
    const best = attempts.data?.reduce((m, a) => Math.max(m, a.score), 0) ?? 0;
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 text-sm space-y-2">
          <p className="flex items-center gap-2 font-medium">
            <Clock className="h-4 w-4 text-warning-foreground" />
            Quiz chronométré
          </p>
          <ul className="text-muted-foreground list-disc pl-5 space-y-1">
            <li>Durée : {fmtTime(totalTime)}</li>
            <li>Une fois démarré, le compteur ne s'arrête pas.</li>
            <li>Si vous ne finissez pas à temps, le quiz est soumis automatiquement.</li>
            <li>Vous pouvez repasser le quiz - <strong>la meilleure note est conservée</strong>.</li>
          </ul>
        </div>

        {attempts.data && attempts.data.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Historique des tentatives
            </p>
            <div className="rounded-lg border border-border divide-y">
              {attempts.data.map((a, i) => (
                <div key={a.uuid} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    #{attempts.data!.length - i} · {format(new Date(a.submitted_at), "d MMM HH:mm", { locale: fr })}
                    {a.auto_submitted && <span className="ml-1 text-warning-foreground">(auto)</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">{fmtTime(a.duration_sec)}</span>
                    <Badge variant={a.score === best ? "default" : "outline"} className="tabular-nums">
                      {a.score}%
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Meilleure note conservée : <strong className="text-foreground">{best}%</strong>
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onFinished}>Fermer</Button>
          <Button onClick={start}>Démarrer le quiz</Button>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 text-center space-y-2">
          <Trophy className="h-8 w-8 mx-auto text-primary" />
          <p className="font-display text-2xl">{result.score}%</p>
          <p className="text-sm text-muted-foreground">
            Meilleure note conservée : <strong className="text-foreground">{result.best}%</strong>
          </p>
          {result.auto && (
            <p className="flex items-center justify-center gap-1 text-xs text-warning-foreground">
              <AlertTriangle className="h-3.5 w-3.5" /> Soumission automatique (temps écoulé)
            </p>
          )}
        </div>
        {questions.map((q, i) => (
          <QuestionBlock
            key={q.id}
            index={i}
            question={q}
            selected={answers[i] ?? []}
            onToggle={() => { }}
            reveal
          />
        ))}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onFinished}>Fermer</Button>
          <Button onClick={start}>Repasser le quiz</Button>
        </div>
      </div>
    );
  }

  const answered = answers.filter((a) => a.length > 0).length;
  const lowTime = remaining <= 30;

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "sticky top-0 z-10 -mx-6 px-6 py-2 border-b flex items-center justify-between bg-background/95 backdrop-blur",
          lowTime && "text-destructive",
        )}
      >
        <span className="text-sm text-muted-foreground">
          {answered}/{questions.length} répondues
        </span>
        <span className="flex items-center gap-1.5 font-medium tabular-nums">
          <Clock className="h-4 w-4" /> {fmtTime(remaining)}
        </span>
      </div>
      {questions.map((q, i) => (
        <QuestionBlock
          key={q.id}
          index={i}
          question={q}
          selected={answers[i] ?? []}
          onToggle={(c) => toggle(i, c, q.multi)}
          reveal={false}
        />
      ))}
      <div className="flex justify-end">
        <Button onClick={() => submit.mutate(false)} disabled={submit.isPending}>
          {submit.isPending ? "Envoi…" : "Soumettre le quiz"}
        </Button>
      </div>
    </div>
  );
}

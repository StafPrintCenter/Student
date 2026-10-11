import { useState } from "react";
import { toast } from "sonner";
import { Play, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuizAttemptsHistory } from "@/components/portal/quiz/quiz-attempts-history";
import { QuizSession } from "@/components/portal/quiz/quiz-session";
import { QuizResult } from "@/components/portal/quiz/quiz-result";
import { useStartQuiz } from "@/stores/useQuizStore";
import { quizModeLabels, type APIQuiz, type APIQuizStartResult, type APIQuizSubmitResult } from "@/data/quiz";

type Phase =
  | { kind: "intro" }
  | { kind: "taking"; start: APIQuizStartResult }
  | { kind: "result"; result: APIQuizSubmitResult; quiz: APIQuiz };

function formatLimit(sec: number) {
  return sec >= 60 ? `${Math.floor(sec / 60)} min${sec % 60 ? ` ${sec % 60} s` : ""}` : `${sec} s`;
}

export function QuizRunner({ quizId }: { quizId: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const startMutation = useStartQuiz();

  const handleStart = () => {
    startMutation.mutate(quizId, {
      onSuccess: (start) => setPhase({ kind: "taking", start }),
      // le message du backend (tentatives max atteintes, quiz indisponible...) est affiché tel quel
      onError: (err) => toast.error(err instanceof Error ? err.message : "Impossible de démarrer le quiz"),
    });
  };

  if (phase.kind === "taking") {
    const { quiz, timeLimitSec } = phase.start;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{quizModeLabels[quiz.mode] ?? quiz.mode}</Badge>
          <span>{quiz.questions.length} questions</span>
          <span>· {quiz.totalPoints} pts</span>
          <span>· seuil {quiz.passScore}%</span>
          {timeLimitSec != null && <span>· {formatLimit(timeLimitSec)}</span>}
        </div>
        <QuizSession
          start={phase.start}
          onSubmitted={(result) => setPhase({ kind: "result", result, quiz })}
          onAborted={() => setPhase({ kind: "intro" })}
        />
      </div>
    );
  }

  if (phase.kind === "result") {
    return <QuizResult result={phase.result} quiz={phase.quiz} onBack={() => setPhase({ kind: "intro" })} />;
  }

  return (
    <div className="space-y-4">
      <QuizAttemptsHistory quizId={quizId} />
      <Button className="w-full" disabled={startMutation.isPending} onClick={handleStart}>
        {startMutation.isPending ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Démarrage…
          </>
        ) : (
          <>
            <Play className="mr-1.5 h-4 w-4" /> Commencer une tentative
          </>
        )}
      </Button>
    </div>
  );
}
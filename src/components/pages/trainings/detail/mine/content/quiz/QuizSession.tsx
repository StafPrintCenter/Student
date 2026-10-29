import { useRef, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizTimer, useCountdown, QuizQuestionCard } from "./";
import { QuizApiError, useSubmitQuizAttempt } from "@/stores/useQuizStore";
import type { APIQuizStartResult, APIQuizSubmitResult, QuizAnswers } from "@/data/quiz";

interface QuizSessionProps {
  start: APIQuizStartResult;
  onSubmitted: (result: APIQuizSubmitResult) => void;
  /** Tentative impossible à soumettre (déjà soumise, temps écoulé refusé...) : retour à l'écran d'historique */
  onAborted: () => void;
}

export function QuizSession({ start, onSubmitted, onAborted }: QuizSessionProps) {
  const { quiz, attemptId, timeLimitSec } = start;
  const questions = [...quiz.questions].sort((a, b) => a.sortOrder - b.sortOrder);

  const [answers, setAnswers] = useState<QuizAnswers>({});
  const answersRef = useRef<QuizAnswers>(answers);
  answersRef.current = answers;
  const submittingRef = useRef(false);

  const submitMutation = useSubmitQuizAttempt();

  const submit = (auto: boolean) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    // Toutes les questions sont envoyées (tableau vide si sans réponse) :
    // un objet "answers" vide serait rejeté en 422 par la règle "required|array".
    const payload: QuizAnswers = Object.fromEntries(questions.map((q) => [q.id, answersRef.current[q.id] ?? []]));

    submitMutation.mutate(
      { attemptId, answers: payload },
      {
        onSuccess: (result) => {
          toast.success(auto ? "Temps écoulé : vos réponses ont été envoyées." : "Quiz soumis.");
          onSubmitted(result);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Erreur lors de la soumission");
          // 409 déjà soumise / 410 temps écoulé refusé : la tentative n'est plus soumettable
          if (err instanceof QuizApiError && (err.status === 409 || err.status === 410)) {
            onAborted();
          }
        },
        onSettled: () => {
          submittingRef.current = false;
        },
      }
    );
  };

  const remaining = useCountdown(timeLimitSec, () => submit(true));

  const answeredCount = questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;
  const unanswered = questions.length - answeredCount;
  const isSubmitting = submitMutation.isPending;

  return (
    <div className="space-y-4">
      {timeLimitSec != null && remaining != null && <QuizTimer remaining={remaining} total={timeLimitSec} />}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <QuizQuestionCard
            key={q.id}
            question={q}
            index={i}
            selected={answers[q.id] ?? []}
            onChange={(ids) => setAnswers((prev) => ({ ...prev, [q.id]: ids }))}
            disabled={isSubmitting}
          />
        ))}
      </div>

      <div className="space-y-2 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {answeredCount}/{questions.length} question{questions.length > 1 ? "s" : ""} répondue{answeredCount > 1 ? "s" : ""}
          {unanswered > 0 && ` · ${unanswered} sans réponse seront comptées fausses`}
        </p>
        <Button className="w-full" disabled={isSubmitting} onClick={() => submit(false)}>
          {isSubmitting ? (
            "Envoi en cours…"
          ) : (
            <>
              <Send className="mr-1.5 h-4 w-4" /> Soumettre mes réponses
            </>
          )}
        </Button>
        <p className="text-[11px] text-muted-foreground">
          La soumission est définitive : une tentative ne peut être envoyée qu'une seule fois.
        </p>
      </div>
    </div>
  );
}
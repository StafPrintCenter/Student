import { CheckCircle2, XCircle, Lightbulb, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { APIQuiz, APIQuizSubmitResult } from "@/data/quiz";

interface QuizResultProps {
  result: APIQuizSubmitResult;
  quiz: APIQuiz;
  onBack: () => void;
}

export function QuizResult({ result, quiz, onBack }: QuizResultProps) {
  const questionsById = new Map(quiz.questions.map((q) => [q.id, q]));

  const labelsOf = (questionId: string, choiceIds: string[]) => {
    const choices = questionsById.get(questionId)?.choices ?? [];
    return choiceIds.map((id) => choices.find((c) => c.id === id)?.label ?? id);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border p-4",
          result.passed ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
        )}
      >
        {result.passed ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        )}
        <div className="space-y-1">
          <p className="font-semibold">{result.passed ? "Quiz réussi" : "Seuil de réussite non atteint"}</p>
          <p className="text-sm">
            Score : <strong className="tabular-nums">{result.score}%</strong>{" "}
            <span className="text-muted-foreground">(seuil : {quiz.passScore}%)</span>
          </p>
          {result.isAutoSubmitted && (
            <p className="text-xs text-muted-foreground">Soumis automatiquement à la fin du temps imparti.</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Correction</p>
        {result.answers.map((a, i) => {
          const question = questionsById.get(a.questionId);
          const explanation = a.explanation ?? question?.explanation ?? null;
          return (
            <div key={a.questionId} className="space-y-2 rounded-lg border border-border p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">
                  <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
                  {a.prompt}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-[10px]",
                    a.isCorrect
                      ? "border-success/40 bg-success/15 text-success"
                      : "border-destructive/40 bg-destructive/10 text-destructive"
                  )}
                >
                  {a.pointsAwarded}/{question?.points ?? "?"} pt
                </Badge>
              </div>

              <p className="text-xs">
                <span className="text-muted-foreground">Votre réponse : </span>
                {a.selectedChoiceIds.length > 0 ? labelsOf(a.questionId, a.selectedChoiceIds).join(", ") : "aucune"}
              </p>
              {!a.isCorrect && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Bonne réponse : </span>
                  <span className="text-success">{labelsOf(a.questionId, a.correctChoiceIds).join(", ")}</span>
                </p>
              )}
              {explanation && (
                <p className="flex items-start gap-1.5 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button variant="outline" className="w-full" onClick={onBack}>
        <RotateCcw className="mr-1.5 h-4 w-4" /> Retour à mes tentatives
      </Button>
    </div>
  );
}
import { useState } from "react";
import { CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { learningApi } from "@/lib/api";
import type { Lesson, QuizQuestion } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface Props {
  training_uuid: string;
  lesson: Lesson;
  onFinished: () => void;
}

export function ExerciseRunner({ training_uuid, lesson, onFinished }: Props) {
  const questions = lesson.questions ?? [];
  const qc = useQueryClient();
  const [answers, setAnswers] = useState<number[][]>(questions.map(() => []));
  const [submitted, setSubmitted] = useState<null | { score: number }>(null);

  const submit = useMutation({
    mutationFn: () =>
      learningApi.submitExercise({ training_uuid, lesson_uuid: lesson.uuid, answers }),
    onSuccess: (res) => {
      setSubmitted({ score: res.score });
      toast.success(`Exercice soumis — ${res.score}%`);
      qc.invalidateQueries({ queryKey: ["training", training_uuid] });
      qc.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
  });

  const toggle = (qi: number, choice: number, multi: boolean) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      if (!multi) {
        next[qi] = [choice];
      } else {
        const set = new Set(prev[qi] ?? []);
        set.has(choice) ? set.delete(choice) : set.add(choice);
        next[qi] = Array.from(set);
      }
      return next;
    });
  };

  const allAnswered = answers.every((a) => a.length > 0);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2">
        <ClipboardList className="h-4 w-4 text-primary mt-0.5" />
        <span>
          Exercice non chronométré. Répondez à toutes les questions puis soumettez —
          votre formateur validera votre score et pourra laisser un commentaire.
        </span>
      </div>

      {questions.map((q, qi) => (
        <QuestionBlock
          key={q.id}
          index={qi}
          question={q}
          selected={answers[qi] ?? []}
          onToggle={(choice) => toggle(qi, choice, q.multi)}
          reveal={!!submitted}
        />
      ))}

      {submitted && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          Score : <strong>{submitted.score}%</strong> — soumission envoyée au formateur.
        </div>
      )}

      <div className="flex justify-end gap-2">
        {submitted ? (
          <Button onClick={onFinished}>Fermer</Button>
        ) : (
          <Button disabled={!allAnswered || submit.isPending} onClick={() => submit.mutate()}>
            {submit.isPending ? "Envoi…" : "Soumettre l'exercice"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function QuestionBlock({
  index,
  question,
  selected,
  onToggle,
  reveal,
}: {
  index: number;
  question: QuizQuestion;
  selected: number[];
  onToggle: (choice: number) => void;
  reveal: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {index + 1}. {question.prompt}
        <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
          {question.multi ? "plusieurs réponses" : "une réponse"}
        </span>
      </p>
      {question.multi ? (
        <div className="space-y-1.5">
          {question.choices.map((c, i) => {
            const isSel = selected.includes(i);
            const isCorrect = reveal && question.correct.includes(i);
            const isWrong = reveal && isSel && !question.correct.includes(i);
            return (
              <label
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors",
                  isCorrect ? "border-success/50 bg-success/5" : isWrong ? "border-destructive/50 bg-destructive/5" : "border-border hover:bg-muted/40",
                )}
              >
                <Checkbox
                  checked={isSel}
                  onCheckedChange={() => onToggle(i)}
                  disabled={reveal}
                  className="mt-0.5"
                />
                <span className="flex-1">{c}</span>
                {reveal && isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                {reveal && isWrong && <XCircle className="h-4 w-4 text-destructive" />}
              </label>
            );
          })}
        </div>
      ) : (
        <RadioGroup
          value={selected[0]?.toString() ?? ""}
          onValueChange={(v) => onToggle(Number(v))}
          disabled={reveal}
        >
          {question.choices.map((c, i) => {
            const id = `q${index}-${i}`;
            const isSel = selected[0] === i;
            const isCorrect = reveal && question.correct.includes(i);
            const isWrong = reveal && isSel && !isCorrect;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                  isCorrect ? "border-success/50 bg-success/5" : isWrong ? "border-destructive/50 bg-destructive/5" : "border-border",
                )}
              >
                <RadioGroupItem value={i.toString()} id={id} />
                <Label htmlFor={id} className="text-sm cursor-pointer flex-1">
                  {c}
                </Label>
                {reveal && isCorrect && <CheckCircle2 className="h-4 w-4 text-success" />}
                {reveal && isWrong && <XCircle className="h-4 w-4 text-destructive" />}
              </div>
            );
          })}
        </RadioGroup>
      )}
    </div>
  );
}

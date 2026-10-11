import { Badge } from "@/components/ui/badge";
import { BadgeInfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { APIQuizQuestion } from "@/data/quiz";

interface QuizQuestionCardProps {
  question: APIQuizQuestion;
  index: number;
  selected: string[];
  onChange: (choiceIds: string[]) => void;
  disabled?: boolean;
}

export function QuizQuestionCard({ question, index, selected, onChange, disabled }: QuizQuestionCardProps) {
  const isMultiple = question.type === "multiple";
  const choices = [...question.choices].sort((a, b) => a.sortOrder - b.sortOrder);

  const toggle = (choiceId: string) => {
    if (isMultiple) {
      onChange(selected.includes(choiceId) ? selected.filter((id) => id !== choiceId) : [...selected, choiceId]);
    } else {
      onChange([choiceId]);
    }
  };

  return (
    <fieldset className="space-y-3 rounded-lg border border-border p-4" disabled={disabled}>
      <legend className="sr-only">Question {index + 1}</legend>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">
          <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>
          {question.prompt}
        </p>

        <Badge variant="outline" className="shrink-0 text-[10px]">
          {question.points} pt{question.points > 1 ? "s" : ""}
        </Badge>
      </div>

      <div>
        <p className="flex items-start gap-1.5 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
          <BadgeInfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {question.explanation}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        {isMultiple ? "Plusieurs réponses possibles" : "Une seule réponse possible"}
      </p>

      <div className="space-y-2">
        {choices.map((choice) => {
          const checked = selected.includes(choice.id);
          return (
            <label
              key={choice.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/40",
                checked ? "border-primary bg-primary/5" : "border-border",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={`question-${question.id}`}
                checked={checked}
                onChange={() => toggle(choice.id)}
                className="h-4 w-4 accent-primary"
              />
              <span>{choice.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
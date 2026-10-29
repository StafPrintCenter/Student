import { ClipboardList } from "lucide-react";
import { ContentBlock, ExternalVideoLink, SubmissionForm, SubmissionHistory } from "./";
import type { APILessonDetail } from "@/data/lesson";

/** Leçons exercise / assignment / project : consigne, dépôts déjà faits, puis formulaire si un dépôt est possible */
export function SubmissionBlock({ lesson }: { lesson: APILessonDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
        {lesson.kind === "exercise"
          ? "Exercice : déposez votre réponse ci-dessous."
          : "Travail à rendre : consultez la consigne, puis déposez votre réponse ci-dessous."}
      </div>

      <ContentBlock content={lesson.content} emptyMessage="Le contenu de cette activité n'a pas encore été renseigné." />
      <ExternalVideoLink url={lesson.videoUrl} />

      <SubmissionHistory submissions={lesson.submissions} />

      {lesson.canSubmitWork ? (
        <SubmissionForm lessonId={lesson.id} kind={lesson.kind} />
      ) : (
        lesson.submissions.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Le dépôt n'est pas disponible pour cette leçon pour le moment.
          </p>
        )
      )}
    </div>
  );
}
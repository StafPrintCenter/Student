// 1. imports
import { submissionStatusMap, submissionSuccessMessages, type APISubmissionResult } from "@/data/lesson";
import type { LessonKind } from "@/data/trainings";

// 2. signature
export function SubmissionForm({ lessonId, kind }: { lessonId: string; kind: LessonKind }) {

  // 3. bloc de succès (le "if (result)")
  if (result) {
    const config = submissionStatusMap[result.status];
    return (
      <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success/5 p-4 text-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <div className="space-y-1">
          <p className="font-medium">{submissionSuccessMessages[kind] ?? "Travail déposé"}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("font-medium", config.className)}>
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Soumis le {new Date(result.submittedAt).toLocaleString("fr-FR")}
            </span>
          </div>
        </div>
      </div>
    );
  }
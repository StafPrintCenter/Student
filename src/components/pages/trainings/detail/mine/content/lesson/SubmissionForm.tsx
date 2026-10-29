import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileUp, Loader2, Paperclip, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCreateSubmission } from "@/stores/useLessonStore";
import {
  submissionStatusMap,
  submissionSuccessMessages,
  type APISubmissionResult,
} from "@/data/lesson";
import type { LessonKind } from "@/data/trainings";

/** Limite côté backend : max:10240 Ko = 10 Mo, vérifiée ici pour un retour immédiat */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface SubmissionFormProps {
  lessonId: string;
  kind: LessonKind;
}

export function SubmissionForm({ lessonId, kind }: SubmissionFormProps) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<APISubmissionResult | null>(null);

  const submitMutation = useCreateSubmission();
  const isSubmitting = submitMutation.isPending;
  const isEmpty = !body.trim() && !file;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_FILE_SIZE_BYTES) {
      setFileError("Le fichier dépasse la taille maximale autorisée (10 Mo).");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFileError(null);
    setFile(selected);
  };

  const handleSubmit = () => {
    if (isEmpty) {
      toast.error("Ajoutez un texte ou un fichier avant de soumettre.");
      return;
    }

    submitMutation.mutate(
      { lessonId, payload: { body: body.trim() || undefined, file: file ?? undefined } },
      {
        onSuccess: (data) => {
          setResult(data);
          toast.success(submissionSuccessMessages[kind] ?? "Travail déposé avec succès.");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors du dépôt"),
      }
    );
  };

  if (result) {
    const config = submissionStatusMap[result.status];
    return (
      <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success/5 p-4 text-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
        <div className="space-y-1">
          <p className="font-medium">{submissionSuccessMessages[kind] ?? "Travail déposé"}</p>
          <div className="flex flex-wrap items-center gap-2">
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

  const bodyId = `submission-body-${lessonId}`;
  const fileId = `submission-file-${lessonId}`;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
      <div className="space-y-2">
        <Label htmlFor={bodyId}>Votre réponse</Label>
        <Textarea
          id={bodyId}
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Décrivez votre travail, collez un lien, ou laissez vide si vous joignez uniquement un fichier…"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={fileId}>Fichier (optionnel)</Label>
        {file ? (
          <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                ({(file.size / 1024 / 1024).toFixed(1)} Mo)
              </span>
            </span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="shrink-0 text-muted-foreground hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
              disabled={isSubmitting}
              aria-label="Retirer le fichier"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={fileId}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground hover:bg-muted/40"
          >
            <FileUp className="h-4 w-4" />
            Choisir un fichier (max 10 Mo)
            <input id={fileId} type="file" className="hidden" onChange={handleFileChange} disabled={isSubmitting} />
          </label>
        )}
        {fileError && <p className="text-xs text-destructive">{fileError}</p>}
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting || isEmpty} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Envoi en cours…
          </>
        ) : (
          <>
            <Send className="mr-1.5 h-4 w-4" /> Soumettre
          </>
        )}
      </Button>
    </div>
  );
}
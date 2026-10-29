import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Paperclip } from "lucide-react";
import { FilePreviewPortal } from "./FilePreview";
import { StatusBadge } from "@/components/shared";
import { resolveStorageUrl } from "@/lib/api/file";
import { submissionStatusMap, type APILessonSubmission } from "@/data/lesson";

const formatDateTime = (iso: string) => format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr });

type Preview = { url: string; title: string };

export function SubmissionHistory({ submissions }: { submissions: APILessonSubmission[] }) {
  const [preview, setPreview] = useState<Preview | null>(null);

  if (submissions.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <p className="text-sm font-medium">Mes dépôts</p>
        <ul className="space-y-3">
          {submissions.map((s) => (
            <SubmissionItem key={s.id} submission={s} onPreview={setPreview} />
          ))}
        </ul>
      </div>

      <FilePreviewPortal
        url={preview?.url ?? null}
        title={preview?.title ?? ""}
        onClose={() => setPreview(null)}
      />
    </>
  );
}

function SubmissionItem({
  submission: s,
  onPreview,
}: {
  submission: APILessonSubmission;
  onPreview: (preview: Preview) => void;
}) {
  const fileUrl = resolveStorageUrl(s.fileUrl);
  const feedback = s.feedback;
  const hasFeedback = !!feedback && (feedback.note != null || !!feedback.comment);

  return (
    <li className="space-y-2 rounded-lg border border-border p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={s.status} map={submissionStatusMap} />
        <span className="text-xs text-muted-foreground">
          {s.attemptsCount} tentative{s.attemptsCount > 1 ? "s" : ""}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Déposé le {formatDateTime(s.submittedAt)}
        {feedback?.gradedAt && ` · corrigé le ${formatDateTime(feedback.gradedAt)}`}
      </p>

      {s.body && <p className="whitespace-pre-line text-sm">{s.body}</p>}

      {fileUrl && (
        <button
          type="button"
          onClick={() => onPreview({ url: fileUrl, title: `Fichier joint · ${formatDateTime(s.submittedAt)}` })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80 cursor-pointer"
        >
          <Paperclip className="h-3.5 w-3.5" /> Voir le fichier joint
        </button>
      )}

      {hasFeedback && (
        <div className="space-y-1 rounded-md border border-primary/30 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" /> Retour du formateur
          </p>
          {feedback.note != null && (
            <p className="text-xs">
              Note : <strong>{feedback.note}/100</strong>
            </p>
          )}
          {feedback.comment && <p className="whitespace-pre-line text-sm">{feedback.comment}</p>}
        </div>
      )}
    </li>
  );
}
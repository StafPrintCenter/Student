import { ExternalLink, FileText, ListOrdered } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ContentBlock({ content, emptyMessage }: { content: string | null; emptyMessage?: string }) {
  if (!content) {
    return emptyMessage ? <EmptyLessonContent icon={FileText} message={emptyMessage} /> : null;
  }
  return (
    <div
      className="prose prose-sm max-w-none whitespace-pre-line dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export function ExternalVideoLink({
  url,
  label = "Voir la ressource vidéo associée",
}: {
  url: string | null;
  label?: string;
}) {
  if (!url) return null;
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-primary underline underline-offset-4"
      >
        <ExternalLink className="h-3.5 w-3.5" /> {label}
      </a>
    </div>
  );
}

export function ChaptersList({ chapters }: { chapters: string[] | null }) {
  if (!chapters || chapters.length === 0) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ListOrdered className="h-3.5 w-3.5" /> Chapitres
      </p>
      <ol className="list-inside list-decimal space-y-1 text-sm">
        {chapters.map((chapter, i) => (
          <li key={i}>{chapter}</li>
        ))}
      </ol>
    </div>
  );
}

export function EmptyLessonContent({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
      <Icon className="h-6 w-6 opacity-50" />
      <p>{message}</p>
    </div>
  );
}
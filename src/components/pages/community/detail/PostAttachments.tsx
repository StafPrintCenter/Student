import { useState } from "react";
import { Download, Eye, File as FileIcon, FileArchive, FileText, Image as ImageIcon, Paperclip } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreviewModal } from "@/components/site/FilePreviewModal";
import { formatFileSize } from "@/components/pages/community/shared";
import { resolveStorageUrl } from "@/lib/api/file";
import type { APICommunityAttachment } from "@/data/community";

const PREVIEWABLE = ["pdf", "jpg", "jpeg", "png", "webp", "gif", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];

// Le modal d'aperçu se base sur l'extension de l'URL
const extensionOf = (value: string) => value.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

function iconFor(mime: string): LucideIcon {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime === "application/pdf") return FileText;
  if (mime.includes("zip")) return FileArchive;
  return FileIcon;
}

type Preview = { url: string; title: string };

export function PostAttachments({ attachments }: { attachments: APICommunityAttachment[] }) {
  const [preview, setPreview] = useState<Preview | null>(null);

  if (attachments.length === 0) return null;

  return (
    <div className="space-y-3 border-t pt-5">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Paperclip className="h-4 w-4 text-primary" /> Pièces jointes ({attachments.length})
      </p>

      <ul className="space-y-2">
        {attachments.map((a) => {
          const url = resolveStorageUrl(a.url) ?? a.url;
          const Icon = iconFor(a.mime);
          const previewable = PREVIEWABLE.includes(extensionOf(url));

          return (
            <li
              key={a.url}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{a.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(a.size)}</span>
                </span>
              </span>

              <span className="flex items-center gap-1">
                {previewable && (
                  <Button size="sm" variant="ghost" onClick={() => setPreview({ url, title: a.name })}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Aperçu
                  </Button>
                )}
                <Button size="sm" variant="ghost" asChild>
                  <a href={url} download={a.name}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Télécharger
                  </a>
                </Button>
              </span>
            </li>
          );
        })}
      </ul>

      <FilePreviewModal url={preview?.url ?? null} title={preview?.title ?? ""} onClose={() => setPreview(null)} />
    </div>
  );
}
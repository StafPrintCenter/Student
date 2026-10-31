import { useState, type ChangeEvent } from "react";
import { FileUp, Paperclip, X } from "lucide-react";

import { formatFileSize } from "@/components/portal/community/community-format";
import { COMMUNITY_LIMITS } from "@/data/community";

interface AttachmentsPickerProps {
  id?: string;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

const { maxAttachments, maxFileBytes, allowedExtensions } = COMMUNITY_LIMITS;

export function AttachmentsPicker({ id, files, onChange, disabled }: AttachmentsPickerProps) {
  const [error, setError] = useState<string | null>(null);

  const handlePick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";

    const accepted: File[] = [];
    const problems = new Set<string>();

    for (const file of picked) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowedExtensions.includes(ext)) problems.add(`« ${file.name} » : format non accepté`);
      else if (file.size > maxFileBytes) problems.add(`« ${file.name} » : plus de 5 Mo`);
      else if (files.length + accepted.length >= maxAttachments) problems.add(`${maxAttachments} fichiers maximum`);
      else accepted.push(file);
    }

    setError(problems.size > 0 ? [...problems].join(" · ") : null);
    if (accepted.length > 0) onChange([...files, ...accepted]);
  };

  const full = files.length >= maxAttachments;

  return (
    <div className="space-y-2">
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Retirer ${file.name}`}
                onClick={() => onChange(files.filter((_, index) => index !== i))}
                className="shrink-0 text-muted-foreground hover:text-destructive disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground hover:bg-muted/40"
        >
          <FileUp className="h-4 w-4" />
          Ajouter des fichiers
          <input
            id={id}
            type="file"
            multiple
            className="hidden"
            disabled={disabled}
            accept={allowedExtensions.map((ext) => `.${ext}`).join(",")}
            onChange={handlePick}
          />
        </label>
      )}

      <p className="text-xs text-muted-foreground">
        {files.length}/{maxAttachments} fichiers · 5 Mo maximum chacun · images, PDF, Office, zip
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
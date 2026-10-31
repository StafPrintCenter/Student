import { useState, type FormEvent } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AttachmentsPicker } from "@/components/pages/community/detail/AttachmentsPicker";
import { PostFormFields } from "@/components/portal/community/post-form-fields";
import { hasUpdates, postFormSchema, toUpdatePayload, type PostFormValues } from "@/components/pages/community/home/FormModel";
import { TagsInput } from "@/components/portal/community/tags-input";
import { COMMUNITY_LIMITS, type APICommunityCategory } from "@/data/community";

interface PostFormProps {
  mode: "create" | "edit";
  initial: PostFormValues;
  categories: APICommunityCategory[];
  trainings: { id: string; title: string }[];

  trainingTitle?: string | null;
  existingAttachmentsCount?: number;
  isPending: boolean;
  onSubmit: (values: PostFormValues) => void;
  onCancel: () => void;
}

export function PostForm({
  mode,
  initial,
  categories,
  trainings,
  trainingTitle,
  existingAttachmentsCount = 0,
  isPending,
  onSubmit,
  onCancel,
}: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // En édition, rien à enregistrer tant que rien n'a changé
  const dirty = mode === "create" || hasUpdates(toUpdatePayload(initial, values));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = postFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        next[issue.path[0] as string] = issue.message;
      });
      setErrors(next);
      return;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PostFormFields
        mode={mode}
        values={values}
        onChange={set}
        errors={errors}
        categories={categories}
        trainings={trainings}
        trainingTitle={trainingTitle}
        disabled={isPending}
      />

      <div className="space-y-1.5">
        <Label htmlFor="post-tags">Tags (facultatif)</Label>
        <TagsInput
          id="post-tags"
          value={values.tags}
          onChange={(tags) => set("tags", tags)}
          max={COMMUNITY_LIMITS.maxTags}
          disabled={isPending}
        />
        {errors.tags && <p className="text-xs text-destructive">{errors.tags}</p>}
      </div>

      {mode === "create" ? (
        <div className="space-y-1.5">
          <Label htmlFor="post-files">Pièces jointes (facultatif)</Label>
          <AttachmentsPicker id="post-files" files={values.files} onChange={(files) => set("files", files)} disabled={isPending} />
        </div>
      ) : (
        existingAttachmentsCount > 0 && (
          <p className="flex items-center gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            <Paperclip className="h-4 w-4 shrink-0" />
            Les {existingAttachmentsCount} pièce{existingAttachmentsCount > 1 ? "s" : ""} jointe
            {existingAttachmentsCount > 1 ? "s" : ""} ne peuvent pas être modifiée{existingAttachmentsCount > 1 ? "s" : ""}.
          </p>
        )
      )}

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || !dirty}>
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Envoi…
            </>
          ) : mode === "create" ? (
            "Publier"
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </form>
  );
}
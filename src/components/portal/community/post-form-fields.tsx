import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/portal/community/native-select";
import type { PostFormValues } from "@/components/pages/community/home/FormModel";
import {
  COMMUNITY_LIMITS,
  communityPostTypeMap,
  STUDENT_POST_TYPES,
  type APICommunityCategory,
  type CommunityPostType,
} from "@/data/community";

interface PostFormFieldsProps {
  mode: "create" | "edit";
  values: PostFormValues;
  onChange: <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) => void;
  errors: Record<string, string>;
  categories: APICommunityCategory[];
  trainings: { id: string; title: string }[];
  /** Mode édition : formation de la publication (non modifiable) */
  trainingTitle?: string | null;
  disabled: boolean;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null;

export function PostFormFields({
  mode,
  values,
  onChange,
  errors,
  categories,
  trainings,
  trainingTitle,
  disabled,
}: PostFormFieldsProps) {
  // Les apprenants ne publient pas d'annonce ; on garde le type actuel s'il en sort (édition)
  const typeOptions: CommunityPostType[] = STUDENT_POST_TYPES.includes(values.type)
    ? STUDENT_POST_TYPES
    : [...STUDENT_POST_TYPES, values.type];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="post-title">Titre</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {values.title.length}/{COMMUNITY_LIMITS.titleMax}
          </span>
        </div>
        <Input
          id="post-title"
          value={values.title}
          maxLength={COMMUNITY_LIMITS.titleMax}
          disabled={disabled}
          onChange={(e) => onChange("title", e.target.value)}
        />
        <FieldError message={errors.title} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="post-category">Catégorie</Label>
          <NativeSelect
            id="post-category"
            value={values.categoryId}
            disabled={disabled}
            onChange={(e) => onChange("categoryId", e.target.value)}
          >
            <option value="">- Choisir -</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
          <FieldError message={errors.categoryId} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="post-type">Type</Label>
          <NativeSelect
            id="post-type"
            value={values.type}
            disabled={disabled}
            onChange={(e) => onChange("type", e.target.value as CommunityPostType)}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {communityPostTypeMap[type].label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-training">Espace de publication</Label>
        {mode === "create" ? (
          <NativeSelect
            id="post-training"
            value={values.trainingId}
            disabled={disabled}
            onChange={(e) => onChange("trainingId", e.target.value)}
          >
            <option value="">Communauté générale</option>
            {trainings.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </NativeSelect>
        ) : (
          <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {trainingTitle ?? "Communauté générale"} · non modifiable
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="post-body">Contenu</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {values.body.length.toLocaleString("fr-FR")}/{COMMUNITY_LIMITS.bodyMax.toLocaleString("fr-FR")}
          </span>
        </div>
        <Textarea
          id="post-body"
          rows={8}
          value={values.body}
          maxLength={COMMUNITY_LIMITS.bodyMax}
          disabled={disabled}
          onChange={(e) => onChange("body", e.target.value)}
          placeholder="Détaillez votre message…"
        />
        <FieldError message={errors.body} />
      </div>
    </div>
  );
}
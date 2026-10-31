import { z } from "zod";
import { COMMUNITY_LIMITS, type APICommunityPostDetail, type CommunityPostCreatePayload, type CommunityPostType, type CommunityPostUpdatePayload } from "@/data/community";

const { titleMin, titleMax, bodyMin, bodyMax, maxTags } = COMMUNITY_LIMITS;

export const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(titleMin, `Le titre doit faire au moins ${titleMin} caractères`)
    .max(titleMax, `${titleMax} caractères maximum`),
  body: z
    .string()
    .trim()
    .min(bodyMin, `Le contenu doit faire au moins ${bodyMin} caractères`)
    .max(bodyMax, `${bodyMax.toLocaleString("fr-FR")} caractères maximum`),
  categoryId: z.string().min(1, "Choisissez une catégorie"),
  trainingId: z.string(),
  type: z.enum(["discussion", "question", "resource", "announcement"]),
  tags: z.array(z.string()).max(maxTags, `${maxTags} tags maximum`),
});

export interface PostFormValues {
  title: string;
  body: string;
  categoryId: string;
  trainingId: string;
  type: CommunityPostType;
  tags: string[];
  files: File[];
}

export const emptyPostValues = (categoryId = "", trainingId = ""): PostFormValues => ({
  title: "",
  body: "",
  categoryId,
  trainingId,
  type: "discussion",
  tags: [],
  files: [],
});

export const valuesFromPost = (post: APICommunityPostDetail): PostFormValues => ({
  title: post.title,
  body: post.body,
  categoryId: post.category.id,
  trainingId: post.training?.id ?? "",
  type: post.type,
  tags: post.tags ?? [],
  files: [],
});

export function toCreatePayload(values: PostFormValues): CommunityPostCreatePayload {
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    categoryId: values.categoryId,
    trainingId: values.trainingId || undefined,
    type: values.type,
    tags: values.tags.length > 0 ? values.tags : undefined,
    attachments: values.files.length > 0 ? values.files : undefined,
  };
}

/** Seuls les champs réellement modifiés sont envoyés */
export function toUpdatePayload(initial: PostFormValues, values: PostFormValues): CommunityPostUpdatePayload {
  const payload: CommunityPostUpdatePayload = {};
  if (values.title.trim() !== initial.title.trim()) payload.title = values.title.trim();
  if (values.body.trim() !== initial.body.trim()) payload.body = values.body.trim();
  if (values.categoryId !== initial.categoryId) payload.categoryId = values.categoryId;
  if (values.type !== initial.type) payload.type = values.type;
  if (values.tags.join(",") !== initial.tags.join(",")) payload.tags = values.tags;
  return payload;
}

export const hasUpdates = (payload: CommunityPostUpdatePayload) => Object.keys(payload).length > 0;
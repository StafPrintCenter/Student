/** Aligné sur App\Enums\CommunityPostType */
export type CommunityPostType = "discussion" | "question" | "resource" | "announcement";

export const communityPostTypeMap: Record<CommunityPostType, { label: string; className: string }> = {
  discussion: { label: "Discussion", className: "bg-muted text-muted-foreground border-border" },
  question: { label: "Question", className: "bg-info/15 text-info border-info/40" },
  resource: { label: "Ressource", className: "bg-emerald/15 text-emerald border-emerald/40" },
  announcement: { label: "Annonce", className: "bg-amber/15 text-amber border-amber/40" },
};

/** Un apprenant ne peut pas publier d'annonce (403 côté backend) */
export const STUDENT_POST_TYPES: CommunityPostType[] = ["discussion", "question", "resource"];

/** Aligné sur App\Enums\CommunityContentStatus */
export type CommunityContentStatus = "published" | "hidden";

export const communityContentStatusLabels: Record<CommunityContentStatus, string> = {
  published: "Publiées",
  hidden: "Masquées",
};

export type CommunityAuthorRole = "admin" | "instructor" | "student";

export const communityAuthorRoleMap: Record<CommunityAuthorRole, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-destructive/10 text-destructive border-destructive/40" },
  instructor: { label: "Formateur", className: "bg-primary/10 text-primary border-primary/40" },
  student: { label: "Apprenant", className: "bg-muted text-muted-foreground border-border" },
};

export type CommunitySort = "recent" | "popular" | "active";

export const communitySortLabels: Record<CommunitySort, string> = {
  recent: "Plus récentes",
  popular: "Plus populaires",
  active: "Activité récente",
};

export type CommunityScope = "general" | "training";

/** Limites de validation du backend */
export const COMMUNITY_LIMITS = {
  titleMin: 3,
  titleMax: 200,
  bodyMin: 3,
  bodyMax: 10000,
  maxTags: 5,
  maxAttachments: 4,
  maxFileBytes: 5 * 1024 * 1024,
  allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip"] as string[],
};

/* ---- Lecture ---- */

export type APICommunityCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
  postsCount: number | null;
};

export type APICommunityCategoryRef = { id: string; name: string; slug: string; color: string };
export type APICommunityTrainingRef = { id: string; title: string };

export type APICommunityAuthor = {
  id: string;
  name: string;
  photo: string | null;
  role: CommunityAuthorRole;
};

export type APICommunityPermissions = {
  canEdit: boolean;
  canDelete: boolean;
  canModerate: boolean;
  canHide: boolean;
  canLock: boolean;
  canComment: boolean;
  canReact: boolean;
  canReport: boolean;
};

export type APICommunityAttachment = {
  name: string;
  url: string;
  mime: string;
  size: number;
};

/** Publication telle que renvoyée par la liste (sans le contenu complet) */
export type APICommunityPostListItem = {
  id: string;
  title: string;
  type: CommunityPostType;
  excerpt: string;
  tags: string[] | null;
  scope: CommunityScope;
  category: APICommunityCategoryRef;
  training: APICommunityTrainingRef | null;
  author: APICommunityAuthor;
  isMine: boolean;
  status: CommunityContentStatus;
  isPinned: boolean;
  isLocked: boolean;
  bestAnswerId: string | null;
  commentsCount: number;
  reactionsTotal: number;
  reactions: Record<string, number>;
  myReaction: string | null;
  viewsCount: number;
  attachmentsCount: number;
  createdAt: string;
  editedAt: string | null;
  permissions: APICommunityPermissions;
  hiddenReason: string | null;
  hiddenAt: string | null;
};

/** GET /api/community/posts/{id} : ajoute le contenu complet et les pièces jointes */
export type APICommunityPostDetail = APICommunityPostListItem & {
  body: string;
  attachments: APICommunityAttachment[];
};

export type APICommunityPostsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type APICommunityPostsListResponse = {
  data: APICommunityPostListItem[];
  meta: APICommunityPostsMeta;
};

/* ---- Écriture ---- */

/** POST /api/community/posts/create : trainingId vide = communauté générale */
export interface CommunityPostCreatePayload {
  title: string;
  body: string;
  categoryId: string;
  trainingId?: string;
  type?: CommunityPostType;
  tags?: string[];
  attachments?: File[];
}

/** PUT /api/community/posts/{id} : seuls les champs fournis sont modifiés (formation et fichiers ne changent pas) */
export interface CommunityPostUpdatePayload {
  title?: string;
  body?: string;
  categoryId?: string;
  type?: CommunityPostType;
  tags?: string[];
}

/** Paramètres de GET /api/community/posts/list */
export interface CommunityPostsListParams {
  page?: number;
  perPage?: number;
  scope?: CommunityScope;
  trainingId?: string;
  categoryId?: string;
  type?: CommunityPostType;
  authorRole?: CommunityAuthorRole;
  pinned?: boolean;
  status?: CommunityContentStatus;
  mine?: boolean;
  unanswered?: boolean;
  query?: string;
  sort?: CommunitySort;
}

/* ---- Commentaires ---- */

export type CommunityCommentSort = "oldest" | "recent" | "popular";

export const communityCommentSortLabels: Record<CommunityCommentSort, string> = {
  oldest: "Plus anciens",
  recent: "Plus récents",
  popular: "Plus populaires",
};

/** Limites de validation du backend */
export const COMMUNITY_COMMENT_LIMITS = { bodyMin: 1, bodyMax: 5000 };

/** Présent sur une réponse : à qui elle s'adresse */
export type APICommunityCommentReplyTo = {
  commentId: string;
  authorId: string;
  authorName: string;
  authorRole: CommunityAuthorRole;
};

export type APICommunityCommentPermissions = {
  canEdit: boolean;
  canDelete: boolean;
  canHide: boolean;
  canReply: boolean;
  canReact: boolean;
  canReport: boolean;
};

export type APICommunityComment = {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  author: APICommunityAuthor;
  isPostAuthor: boolean;
  isBestAnswer: boolean;
  isMine: boolean;
  status: CommunityContentStatus;
  replyTo: APICommunityCommentReplyTo | null;
  repliesCount: number;
  reactionsTotal: number;
  reactions: Record<string, number>;
  myReaction: string | null;
  createdAt: string;
  editedAt: string | null;
  permissions: APICommunityCommentPermissions;
  hiddenReason?: string | null;
  hiddenAt?: string | null;
};

export type APICommunityCommentsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type APICommunityCommentsListResponse = {
  data: APICommunityComment[];
  meta: APICommunityCommentsMeta;
};

/** Paramètres de GET /api/community/posts/{postId}/comments/list */
export type CommunityCommentsListParams = {
  page?: number;
  perPage?: number;
  sort?: CommunityCommentSort;
  authorRole?: CommunityAuthorRole;
};

/** Paramètres de GET /api/community/comments/{id}/replies (toujours du plus ancien au plus récent) */
export type CommunityRepliesListParams = Pick<CommunityCommentsListParams, "page" | "perPage">;

/** POST /api/community/posts/{postId}/comments/create : parentId = commentaire auquel on répond */
export type CommunityCommentCreatePayload = {
  body: string;
  parentId?: string;
};

/* ---- Réactions ---- */

/** Aligné sur App\Enums\CommunityReactionType (backend) */
export type CommunityReactionType = "like" | "love" | "celebrate" | "support" | "insightful" | "funny";

export const communityReactionMap: Record<CommunityReactionType, { label: string; emoji: string }> = {
  like: { label: "J'aime", emoji: "👍" },
  love: { label: "J'adore", emoji: "❤️" },
  celebrate: { label: "Bravo", emoji: "🎉" },
  support: { label: "Soutien", emoji: "🤝" },
  insightful: { label: "Instructif", emoji: "💡" },
  funny: { label: "Drôle", emoji: "😄" },
};

export const COMMUNITY_REACTION_TYPES = Object.keys(communityReactionMap) as CommunityReactionType[];

/** Type inconnu du front (ajouté côté backend) : affiché sans casser la page */
export function getReactionConfig(type: string): { label: string; emoji: string } {
  return communityReactionMap[type as CommunityReactionType] ?? { label: type, emoji: "👍" };
}

/** Ce sur quoi on réagit : une publication ou un commentaire */
export type CommunityReactionTarget = { kind: "post" | "comment"; id: string };

/** État renvoyé après avoir réagi ou retiré sa réaction */
export type APICommunityReactionState = {
  myReaction: string | null;
  reactions: Record<string, number>;
  reactionsTotal: number;
};

export type APICommunityReactionItem = {
  id: string;
  type: CommunityReactionType;
  reactedAt: string;
  user: APICommunityAuthor;
};

/** GET /api/community/{posts|comments}/{id}/reactions/list */
export type APICommunityReactionsListResponse = {
  /** Nombre de réactions par type, indépendant des filtres */
  summary: Partial<Record<CommunityReactionType, number>>;
  total: number;
  data: APICommunityReactionItem[];
  meta: APICommunityPostsMeta;
};

export type CommunityReactionsListParams = {
  page?: number;
  perPage?: number;
  type?: CommunityReactionType;
  /** Rôle de la personne qui a réagi */
  role?: CommunityAuthorRole;
};
import { NativeSelect } from "@/components/pages/community/shared";
import {
  communityAuthorRoleMap,
  communityCommentSortLabels,
  type CommunityAuthorRole,
  type CommunityCommentSort,
} from "@/data/community";

interface CommentsToolbarProps {
  /** Nombre total de commentaires de la publication (réponses comprises) */
  count: number;
  sort: CommunityCommentSort;
  authorRole: CommunityAuthorRole | "";
  onSortChange: (sort: CommunityCommentSort) => void;
  onAuthorRoleChange: (role: CommunityAuthorRole | "") => void;
}

export function CommentsToolbar({ count, sort, authorRole, onSortChange, onAuthorRoleChange }: CommentsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-lg font-semibold">
        Commentaires <span className="text-muted-foreground">({count})</span>
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          className="sm:w-auto"
          value={authorRole}
          onChange={(e) => onAuthorRoleChange(e.target.value as CommunityAuthorRole | "")}
          aria-label="Filtrer par rôle de l'auteur"
        >
          <option value="">Tous les auteurs</option>
          {(Object.keys(communityAuthorRoleMap) as CommunityAuthorRole[]).map((role) => (
            <option key={role} value={role}>
              {communityAuthorRoleMap[role].label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          className="sm:w-auto"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as CommunityCommentSort)}
          aria-label="Trier les commentaires"
        >
          {(Object.keys(communityCommentSortLabels) as CommunityCommentSort[]).map((s) => (
            <option key={s} value={s}>
              {communityCommentSortLabels[s]}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
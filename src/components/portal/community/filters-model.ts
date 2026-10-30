import type { CommunityPostsListParams, CommunityPostType, CommunitySort } from "@/data/community";

export interface CommunityFilters {
  query: string;
  categoryId: string;
  /** "" (partout) | "general" | "training" (toutes mes formations) | "t:<trainingId>" */
  place: string;
  type: CommunityPostType | "";
  sort: CommunitySort;
  mine: boolean;
  unanswered: boolean;
}

export const DEFAULT_COMMUNITY_FILTERS: CommunityFilters = {
  query: "",
  categoryId: "",
  place: "",
  type: "",
  sort: "recent",
  mine: false,
  unanswered: false,
};

export const TRAINING_PLACE_PREFIX = "t:";

export const hasActiveFilters = (f: CommunityFilters) =>
  (Object.keys(DEFAULT_COMMUNITY_FILTERS) as (keyof CommunityFilters)[]).some(
    (key) => f[key] !== DEFAULT_COMMUNITY_FILTERS[key]
  );

export const trainingIdFromPlace = (place: string) =>
  place.startsWith(TRAINING_PLACE_PREFIX) ? place.slice(TRAINING_PLACE_PREFIX.length) : "";

export function toListParams(
  filters: CommunityFilters,
  query: string,
  page: number,
  perPage: number
): CommunityPostsListParams {
  return {
    page,
    perPage,
    query: query || undefined,
    categoryId: filters.categoryId || undefined,
    scope: filters.place === "general" || filters.place === "training" ? filters.place : undefined,
    trainingId: trainingIdFromPlace(filters.place) || undefined,
    type: filters.type || undefined,
    sort: filters.sort,
    mine: filters.mine || undefined,
    unanswered: filters.unanswered || undefined,
  };
}
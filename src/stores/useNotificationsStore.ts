import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentFetch } from "@/lib/api-url";
import type {
  APINotificationDetail,
  APINotificationPreference,
  APINotificationsListResponse,
  NotificationPreferencePayload,
} from "@/data/notifications";

const resourceKey = "notifications";
const preferencesKey = "notification-preferences";

/** Message du backend, sinon première erreur de validation (422 renvoie { errors: { champ: [...] } }) */
async function toError(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => null);
  const firstError = body?.errors ? (Object.values(body.errors).flat()[0] as string | undefined) : undefined;
  return new Error(body?.message || firstError || fallback);
}

/* ---- Liste ---- */

export interface NotificationsListParams {
  page?: number;
  perPage?: number;
}

async function fetchNotifications(params: NotificationsListParams = {}): Promise<APINotificationsListResponse> {
  const qp = new URLSearchParams();
  qp.append("page", String(params.page ?? 1));
  qp.append("perPage", String(params.perPage ?? 20));

  const response = await studentFetch(`/api/notifications/manage/list?${qp.toString()}`);
  if (!response.ok) throw await toError(response, "Erreur lors de la récupération des notifications");
  return response.json();
}

export const fetchStudentNotifications = fetchNotifications;

export function useNotificationsList(params: NotificationsListParams = {}) {
  const query = useQuery({
    queryKey: [resourceKey, "list", params],
    queryFn: () => fetchNotifications(params),
    staleTime: 1000 * 30,
  });
  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/* ---- Détail ---- */

async function fetchNotificationById(id: string): Promise<APINotificationDetail | null> {
  const response = await studentFetch(`/api/notifications/manage/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw await toError(response, "Erreur lors de la récupération de la notification");
  const json: { data: APINotificationDetail } = await response.json();
  return json.data;
}

export const fetchStudentNotificationById = fetchNotificationById;

export function useNotificationDetail(id: string | undefined) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: [resourceKey, "detail", id],
    queryFn: async () => {
      const item = await fetchNotificationById(id as string);
      // D'après les réponses de l'API, consulter le détail marque la notification comme lue :
      // on rafraîchit la liste et le badge (sans toucher à la clé "detail", pour éviter une boucle).
      qc.invalidateQueries({ queryKey: [resourceKey, "list"] });
      qc.invalidateQueries({ queryKey: [resourceKey, "unread-count"] });
      return item;
    },
    enabled: !!id,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Compteur de non lues (badge) ---- */

async function fetchUnreadCount(): Promise<number> {
  const response = await studentFetch(`/api/notifications/manage/unread-count`);
  if (!response.ok) throw await toError(response, "Erreur lors de la récupération du compteur");
  const json: { data: { unreadCount: number } } = await response.json();
  return json.data.unreadCount;
}

export const fetchStudentUnreadNotificationsCount = fetchUnreadCount;

export function useUnreadNotificationsCount() {
  const query = useQuery({
    queryKey: [resourceKey, "unread-count"],
    queryFn: fetchUnreadCount,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
  return { count: query.data ?? 0, isLoading: query.isLoading };
}

/* ---- Marquer comme lue (sans ouvrir) ---- */

async function markAsRead(id: string): Promise<void> {
  const response = await studentFetch(`/api/notifications/manage/${id}/read`, { method: "PATCH" });
  if (!response.ok) throw await toError(response, "Erreur lors du marquage de la notification");
}

export const markStudentNotificationAsRead = markAsRead;

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

/* ---- Tout marquer comme lu ---- */

async function markAllAsRead(): Promise<string> {
  const response = await studentFetch(`/api/notifications/manage/read-all`, { method: "PATCH" });
  if (!response.ok) throw await toError(response, "Erreur lors du marquage des notifications");
  const json: { message: string } = await response.json();
  return json.message;
}

export const markAllStudentNotificationsAsRead = markAllAsRead;

export function useMarkAllNotificationsAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

/* ---- Préférences ---- */

async function fetchPreferences(): Promise<APINotificationPreference[]> {
  const response = await studentFetch(`/api/notifications/preferences`);
  if (!response.ok) throw await toError(response, "Erreur lors de la récupération des préférences");
  const json: { data: APINotificationPreference[] } = await response.json();
  return json.data;
}

export const fetchStudentNotificationPreferences = fetchPreferences;

export function useNotificationPreferences() {
  const query = useQuery({
    queryKey: [preferencesKey],
    queryFn: fetchPreferences,
    staleTime: 1000 * 30,
  });
  return { items: query.data ?? [], isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/**
 * Le backend lit scheduleDays comme une chaîne "1,5" (un JSON "[1,5]" donnerait des valeurs invalides)
 * et accepte enabled en 1/0. Les champs d'horaire ne sont envoyés qu'en mode "scheduled".
 */
async function updatePreference(
  category: string,
  payload: NotificationPreferencePayload
): Promise<APINotificationPreference> {
  const fd = new FormData();
  fd.append("enabled", payload.enabled ? "1" : "0");
  fd.append("deliveryMode", payload.deliveryMode);
  if (payload.deliveryMode === "scheduled") {
    fd.append("scheduleDays", [...payload.scheduleDays].sort((a, b) => a - b).join(","));
    fd.append("scheduleStartTime", payload.scheduleStartTime);
    fd.append("scheduleEndTime", payload.scheduleEndTime);
  }

  const response = await studentFetch(`/api/notifications/preferences/${category}`, {
    method: "PUT",
    body: fd,
  });
  if (!response.ok) throw await toError(response, "Erreur lors de la mise à jour de la préférence");
  const json: { data: APINotificationPreference } = await response.json();
  return json.data;
}

export const updateStudentNotificationPreference = updatePreference;

export function useUpdateNotificationPreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ category, payload }: { category: string; payload: NotificationPreferencePayload }) =>
      updatePreference(category, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [preferencesKey] }),
  });
}
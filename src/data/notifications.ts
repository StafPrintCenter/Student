/** Catégories rencontrées dans /notifications/preferences */
export type NotificationCategory = "security" | "general" | "profile" | "training" | "payment" | "community";

export const notificationCategoryMap: Record<
  NotificationCategory,
  { label: string; description: string; className: string }
> = {
  security: {
    label: "Sécurité",
    description: "Connexions et alertes sur votre compte. Toujours actives et instantanées.",
    className: "bg-destructive/10 text-destructive border-destructive/40",
  },
  general: {
    label: "Général",
    description: "Messages et informations générales de la plateforme.",
    className: "bg-muted text-muted-foreground border-border",
  },
  profile: {
    label: "Profil",
    description: "Changements liés à votre profil et à votre compte.",
    className: "bg-info/15 text-info border-info/40",
  },
  training: {
    label: "Formations",
    description: "Inscriptions, leçons, corrections et certificats.",
    className: "bg-primary/15 text-primary border-primary/40",
  },
  payment: {
    label: "Paiements",
    description: "Règlements, reçus et échéances.",
    className: "bg-warning/15 text-warning-foreground border-warning/40",
  },
  community: {
    label: "Communauté",
    description: "Échanges et activité de la communauté.",
    className: "bg-success/15 text-success border-success/40",
  },
};

export type NotificationDeliveryMode = "instant" | "scheduled";

export const notificationDeliveryModeLabels: Record<NotificationDeliveryMode, string> = {
  instant: "Instantanée",
  scheduled: "Programmée",
};

/** 1 = lundi ... 7 = dimanche (convention du backend) */
export const NOTIFICATION_WEEKDAYS = [
  { value: 1, short: "Lun", full: "Lundi" },
  { value: 2, short: "Mar", full: "Mardi" },
  { value: 3, short: "Mer", full: "Mercredi" },
  { value: 4, short: "Jeu", full: "Jeudi" },
  { value: 5, short: "Ven", full: "Vendredi" },
  { value: 6, short: "Sam", full: "Samedi" },
  { value: 7, short: "Dim", full: "Dimanche" },
] as const;

/** Élément de GET /api/notifications/manage/list */
export type APINotificationListItem = {
  id: string;
  category: NotificationCategory | string;
  type: string;
  title: string;
  isRead: boolean;
  deliveredAt: string;
};

export type APINotificationsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  unreadTotal: number;
};

export type APINotificationsListResponse = {
  data: APINotificationListItem[];
  meta: APINotificationsMeta;
};

/** GET /api/notifications/manage/{id} : data et actionUrl sont facultatifs */
export type APINotificationDetail = APINotificationListItem & {
  body: string;
  data?: Record<string, unknown> | null;
  actionUrl?: string | null;
  readAt: string | null;
};

/** Élément de GET /api/notifications/preferences */
export type APINotificationPreference = {
  category: NotificationCategory | string;
  /** true pour "security" : non modifiable (403 côté backend) */
  locked: boolean;
  enabled: boolean;
  deliveryMode: NotificationDeliveryMode;
  scheduleDays: number[];
  /** Renvoyé au format HH:MM:SS, ex: "20:00:00" */
  scheduleStartTime: string | null;
  scheduleEndTime: string | null;
};

/** Payload de PUT /api/notifications/preferences/{category} (horaires au format HH:MM) */
export type NotificationPreferencePayload =
  | { enabled: boolean; deliveryMode: "instant" }
  | {
    enabled: boolean;
    deliveryMode: "scheduled";
    scheduleDays: number[];
    scheduleStartTime: string;
    scheduleEndTime: string;
  };

/** "20:00:00" -> "20:00" : le backend valide les horaires en H:i, il refuse HH:MM:SS */
export function toTimeInput(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : "";
}

/**
 * actionUrl arrive sous la forme "/student/..." : le layout _student ne fait pas partie des URLs du front,
 * donc on retire ce préfixe. Les liens http(s) sont considérés comme externes.
 */
export function resolveNotificationActionUrl(actionUrl: string): { external: boolean; href: string } {
  if (/^https?:\/\//i.test(actionUrl)) return { external: true, href: actionUrl };
  return { external: false, href: actionUrl.replace(/^\/student(?=\/|$)/, "") || "/" };
}
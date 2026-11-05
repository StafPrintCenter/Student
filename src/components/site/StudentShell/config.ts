import { LayoutDashboard, GraduationCap, Users2, LineChart, BadgeCheck, Calendar, Bell, CreditCard, UserCircle, Shield, MonitorSmartphone } from "lucide-react";
import { SITE_LINK } from "@/data/site";

export const docsUrl = `${SITE_LINK.docsUrl}/docs/student/index`;

export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  matchPrefixes?: string[];
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Général",
    items: [
      { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/notifications", label: "Notifications", icon: Bell, matchPrefixes: ["/notifications"] },
    ],
  },
  {
    label: "Session",
    items: [
      { to: "/trainings", label: "Formations", icon: GraduationCap },
      { to: "/progress", label: "Progression", icon: LineChart },
      { to: "/sessions", label: "Sessions", icon: Calendar },
    ],
  },
  {
    label: "Librairie",
    items: [
      { to: "/certificates", label: "Certificats", icon: BadgeCheck },
      { to: "/payments", label: "Paiements", icon: CreditCard },
    ],
  },
  {
    label: "Échanges",
    items: [
      { to: "/community/posts", label: "Communauté", icon: Users2, matchPrefixes: ["/community"] },
    ],
  },
];

export const navItemClass =
  "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground " +
  "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground " +
  "data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground";

// Liens du dropdown utilisateur
export const USER_DROPDOWN_ITEMS = [
  { to: "/profile", label: "Mon profil", icon: UserCircle },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/security", label: "Sécurité du compte", icon: Shield },
  { to: "/security-sessions", label: "Sessions actives", icon: MonitorSmartphone },
] as const;
import { Bell, CreditCard, GraduationCap, ShieldCheck, UserCircle, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { notificationCategoryMap, type NotificationCategory } from "@/data/notifications";

const categoryIcons: Record<NotificationCategory, typeof Bell> = {
  security: ShieldCheck,
  general: Bell,
  profile: UserCircle,
  training: GraduationCap,
  payment: CreditCard,
  community: Users2,
};

export function NotificationCategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = categoryIcons[category as NotificationCategory] ?? Bell;
  return <Icon className={className} />;
}

export function NotificationCategoryBadge({ category, className }: { category: string; className?: string }) {
  const config = notificationCategoryMap[category as NotificationCategory] ?? {
    label: category,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
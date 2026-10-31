import { cn } from "@/lib/utils";
import { resolveStorageUrl } from "@/lib/api/file";
import { initialsOf } from "@/components/pages/community/shared/Format";

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm" } as const;

interface CommunityAvatarProps {
  name: string;
  photo: string | null;
  size?: keyof typeof sizes;
}

export function CommunityAvatar({ name, photo, size = "md" }: CommunityAvatarProps) {
  const src = resolveStorageUrl(photo);

  if (src) {
    return <img src={src} alt={name} className={cn("shrink-0 rounded-full border border-border object-cover", sizes[size])} />;
  }
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary", sizes[size])}
    >
      {initialsOf(name)}
    </span>
  );
}
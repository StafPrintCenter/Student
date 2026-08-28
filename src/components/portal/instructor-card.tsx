import { GraduationCap, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Instructor } from "@/lib/api/types";

export function InstructorCard({ instructor, fallbackName }: { instructor?: Instructor; fallbackName?: string }) {
  const name = instructor?.name ?? fallbackName ?? "Formateur";
  const title = instructor?.title ?? "Formateur assigné";
  const bio = instructor?.bio;
  const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarFallback className="bg-primary/15 text-primary font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1">
            <GraduationCap className="h-3 w-3" /> Formateur assigné
          </p>
          <p className="font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{title}</p>
        </div>
      </div>
      {bio && <p className="text-xs text-muted-foreground">{bio}</p>}
      <button className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border py-1.5 text-xs text-muted-foreground hover:bg-muted">
        <MessageCircle className="h-3.5 w-3.5" /> Envoyer un message
      </button>
    </div>
  );
}

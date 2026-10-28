import { ExternalLink, MapPin, Video } from "lucide-react";
import type { APIStudentSession } from "@/data/sessions";

interface SessionPlaceProps {
  session: Pick<APIStudentSession, "modality" | "location" | "meetingUrl">;
  showIcon?: boolean;
}

/** Lieu en présentiel, lien de connexion en ligne */
export function SessionPlace({ session, showIcon = true }: SessionPlaceProps) {
  if (session.modality === "online") {
    return session.meetingUrl ? (
      <a
        href={session.meetingUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
      >
        {showIcon && <Video className="h-3.5 w-3.5 shrink-0" />}
        Rejoindre la réunion <ExternalLink className="h-3 w-3" />
      </a>
    ) : (
      <span className="inline-flex items-center gap-1.5">
        {showIcon && <Video className="h-3.5 w-3.5 shrink-0" />}
        Lien de connexion à venir
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {showIcon && <MapPin className="h-3.5 w-3.5 shrink-0" />}
      {session.location ?? "Lieu à préciser"}
    </span>
  );
}
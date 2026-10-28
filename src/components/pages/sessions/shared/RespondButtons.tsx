import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionResponse } from "@/data/sessions";
import { useRespondToSession } from "@/stores/useSessionsStore";

interface SessionRespondButtonsProps {
  sessionId: string;
  myResponse: SessionResponse | null;
  size?: "sm" | "default";
  className?: string;
}

export function SessionRespondButtons({ sessionId, myResponse, size = "sm", className }: SessionRespondButtonsProps) {
  const respondMutation = useRespondToSession();
  const busy = respondMutation.isPending;
  const loadingFor = (answer: SessionResponse) => busy && respondMutation.variables?.response === answer;

  const submit = (answer: SessionResponse) => {
    if (answer === myResponse) return;
    respondMutation.mutate(
      { sessionId, response: answer },
      {
        onSuccess: () =>
          toast.success(answer === "confirmed" ? "Votre présence est confirmée." : "Votre absence a été enregistrée."),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement"),
      }
    );
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        size={size}
        variant={myResponse === "confirmed" ? "default" : "outline"}
        aria-pressed={myResponse === "confirmed"}
        disabled={busy}
        onClick={() => submit("confirmed")}
      >
        {loadingFor("confirmed") ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="mr-1.5 h-3.5 w-3.5" />
        )}
        Je participe
      </Button>
      <Button
        size={size}
        variant={myResponse === "declined" ? "destructive" : "outline"}
        aria-pressed={myResponse === "declined"}
        disabled={busy}
        onClick={() => submit("declined")}
      >
        {loadingFor("declined") ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="mr-1.5 h-3.5 w-3.5" />
        )}
        Je ne peux pas
      </Button>
    </div>
  );
}
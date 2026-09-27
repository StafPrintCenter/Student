import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, MessageSquare } from "lucide-react";

import { PageHeader } from "@/components/portal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TicketBadge } from "@/components/portal/status-badges";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/portal/empty-state";
import { supportApi } from "@/lib/api";
import type { SupportTicket } from "@/lib/api/types";

export const Route = createFileRoute("/_student/support")({
  head: () => ({
    meta: [
      { title: "Support - STAF Student Portal" },
      { name: "description", content: "Contactez l'administration et suivez vos tickets." },
      { property: "og:title", content: "Support - STAF" },
      { property: "og:description", content: "Contactez l'administration et suivez vos tickets." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["tickets"], queryFn: supportApi.list });
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [active, setActive] = useState<SupportTicket | null>(null);

  const create = useMutation({
    mutationFn: () => supportApi.create({ subject, body }),
    onSuccess: () => {
      toast.success("Ticket créé.");
      setOpen(false); setSubject(""); setBody("");
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
  const [reply, setReply] = useState("");
  const send = useMutation({
    mutationFn: () => supportApi.reply(active!.uuid, reply),
    onSuccess: (tk) => {
      toast.success("Message envoyé.");
      setReply("");
      qc.invalidateQueries({ queryKey: ["tickets"] });
      setActive(tk);
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assistance"
        title="Support"
        description="Écrivez à l'administration, suivez vos tickets et retrouvez vos échanges."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1.5" />Nouveau ticket</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouveau ticket</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Sujet</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
                <div className="space-y-2"><Label>Message</Label><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                <Button disabled={!subject || !body || create.isPending} onClick={() => create.mutate()}>Envoyer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Mes tickets</CardTitle></CardHeader>
          <CardContent className="p-0 divide-y">
            {(data ?? []).length === 0 && <div className="p-6"><EmptyState icon={MessageSquare} title="Pas encore de ticket" /></div>}
            {(data ?? []).map((t) => (
              <button
                key={t.uuid}
                onClick={() => setActive(t)}
                className={`w-full text-left p-4 hover:bg-muted/40 transition-colors ${active?.uuid === t.uuid ? "bg-muted/60" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{t.subject}</p>
                  <TicketBadge status={t.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.body}</p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {format(new Date(t.created_at), "d MMM yyyy", { locale: fr })}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          {active ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{active.subject}</CardTitle>
                  <TicketBadge status={active.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {active.messages.map((m) => (
                    <div key={m.uuid} className={`flex ${m.from === "student" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.from === "student" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p>{m.body}</p>
                        <p className={`text-[10px] mt-1 ${m.from === "student" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {format(new Date(m.at), "d MMM · HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 border-t pt-3">
                  <Input placeholder="Votre réponse…" value={reply} onChange={(e) => setReply(e.target.value)} />
                  <Button onClick={() => send.mutate()} disabled={!reply || send.isPending}>Envoyer</Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Sélectionnez un ticket pour afficher la conversation.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

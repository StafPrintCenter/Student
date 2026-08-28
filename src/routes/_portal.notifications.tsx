import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { PageHeader } from "@/components/portal/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/portal/empty-state";
import { notificationApi } from "@/lib/api";

export const Route = createFileRoute("/_portal/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — STAF Student Portal" },
      { name: "description", content: "Centre de notifications de votre parcours." },
      { property: "og:title", content: "Notifications — STAF" },
      { property: "og:description", content: "Toutes vos notifications au même endroit." },
    ],
  }),
  component: () => {
    const qc = useQueryClient();
    const { data } = useQuery({ queryKey: ["notifications"], queryFn: notificationApi.list });
    const markAll = useMutation({
      mutationFn: notificationApi.markAllRead,
      onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    });
    const markOne = useMutation({
      mutationFn: (id: string) => notificationApi.markRead(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    });
    const [q, setQ] = useState("");
    const [filter, setFilter] = useState<"all" | "unread">("all");

    let items = data ?? [];
    if (filter === "unread") items = items.filter((n) => !n.read);
    if (q) items = items.filter((n) => (n.title + n.body).toLowerCase().includes(q.toLowerCase()));

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Centre"
          title="Notifications"
          actions={
            <Button variant="outline" onClick={() => markAll.mutate()}>
              <CheckCheck className="h-4 w-4 mr-1.5" /> Tout marquer comme lu
            </Button>
          }
        />
        <div className="flex flex-wrap gap-3 items-center">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="unread">Non lues</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        </div>

        {items.length === 0 ? (
          <EmptyState icon={Bell} title="Aucune notification" description="Vous êtes à jour !" />
        ) : (
          <Card>
            <CardContent className="p-0 divide-y">
              {items.map((n) => (
                <button
                  key={n.uuid}
                  onClick={() => !n.read && markOne.mutate(n.uuid)}
                  className="w-full text-left flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${n.read ? "bg-border" : "bg-primary"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(n.created_at), { locale: fr, addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  },
});

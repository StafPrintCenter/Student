import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Heart, MessageCircle, Plus, Users, Sparkles, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

import { PageHeader } from "@/components/portal/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { communityApi, trainingApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/community")({
  head: () => ({
    meta: [
      { title: "Communauté - STAF Student Portal" },
      { name: "description", content: "Échangez avec les apprenants et les formateurs STAF." },
      { property: "og:title", content: "Communauté - STAF" },
      { property: "og:description", content: "Discussions, entraide et annonces des formateurs." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const [trainingFilter, setTrainingFilter] = useState<string>("all");
  const trainings = useQuery({ queryKey: ["trainings-min"], queryFn: () => trainingApi.list() });
  const filter = trainingFilter === "all" ? undefined : { training_uuid: trainingFilter };
  const posts = useQuery({
    queryKey: ["community-posts", trainingFilter],
    queryFn: () => communityApi.list(filter),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Espace communauté"
        title="Communauté"
        description="Discutez, partagez vos brouillons, posez vos questions à vos formateurs et à la promotion."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={trainingFilter} onValueChange={setTrainingFilter}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Filtrer par formation" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les formations</SelectItem>
                {trainings.data?.map((t) => (
                  <SelectItem key={t.uuid} value={t.uuid}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <NewPost trainings={trainings.data ?? []} />

          {posts.isLoading && <Skeleton className="h-64" />}
          {posts.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun post pour ce filtre.</p>
          )}
          {posts.data?.map((p) => <PostCard key={p.uuid} post={p} trainings={trainings.data ?? []} />)}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Membres actifs</p>
              <div className="space-y-2">
                {["Amina Adjovi", "Kader Sossa", "Reine Aholou", "Séraphin Houngbédji"].map((n) => (
                  <div key={n} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-primary text-[11px]">
                        {n.split(" ").map((s) => s[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate">{n}</span>
                    <span className="h-2 w-2 rounded-full bg-success" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Charte</p>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                <li>Bienveillance et retours constructifs.</li>
                <li>Partager, pas juger.</li>
                <li>Créditer les sources.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NewPost({ trainings }: { trainings: { uuid: string; title: string }[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [trainingUuid, setTrainingUuid] = useState<string>("none");
  const create = useMutation({
    mutationFn: () => communityApi.create({
      title, body,
      training_uuid: trainingUuid === "none" ? undefined : trainingUuid,
    }),
    onSuccess: () => {
      toast.success("Publication ajoutée.");
      setOpen(false); setTitle(""); setBody(""); setTrainingUuid("none");
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  if (!open) {
    return (
      <Button variant="outline" className="w-full justify-start" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" /> Nouvelle publication
      </Button>
    );
  }
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Votre message…" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        <Select value={trainingUuid} onValueChange={setTrainingUuid}>
          <SelectTrigger><SelectValue placeholder="Formation (optionnel)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Général</SelectItem>
            {trainings.map((t) => (
              <SelectItem key={t.uuid} value={t.uuid}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={() => create.mutate()} disabled={!title.trim() || !body.trim() || create.isPending}>
            Publier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post, trainings }: { post: any; trainings: { uuid: string; title: string }[] }) {
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const [openReply, setOpenReply] = useState(false);
  const training = trainings.find((t) => t.uuid === post.training_uuid);
  const like = useMutation({
    mutationFn: () => communityApi.like(post.uuid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
  });
  const replyM = useMutation({
    mutationFn: () => communityApi.reply(post.uuid, reply),
    onSuccess: () => {
      setReply(""); setOpenReply(false);
      qc.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
  const initials = post.author.split(" ").map((s: string) => s[0]).join("").slice(0, 2);
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={cn(
              "text-xs font-semibold",
              post.author_role === "instructor" ? "bg-primary/15 text-primary" : "bg-muted",
            )}>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium truncate">{post.author}</p>
              {post.author_role === "instructor" && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40 text-[10px]">Formateur</Badge>
              )}
              {training && <Badge variant="outline" className="text-[10px]">{training.title}</Badge>}
              {post.tags?.map((t: string) => (
                <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { locale: fr, addSuffix: true })}
            </p>
          </div>
        </div>
        <h3 className="font-display text-lg leading-snug">{post.title}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.body}</p>
        <div className="flex items-center gap-3 pt-1 text-sm">
          <button
            onClick={() => like.mutate()}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted",
              post.liked && "text-destructive",
            )}
          >
            <Heart className={cn("h-4 w-4", post.liked && "fill-current")} />
            <span className="tabular-nums text-xs">{post.likes}</span>
          </button>
          <button
            onClick={() => setOpenReply((o) => !o)}
            className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="tabular-nums text-xs">{post.replies.length}</span>
          </button>
        </div>

        {post.replies.length > 0 && (
          <div className="pl-4 border-l border-border space-y-2">
            {post.replies.map((r: any) => (
              <div key={r.uuid} className="text-sm">
                <p className="text-xs font-medium">{r.author}
                  <span className="text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(r.at), { locale: fr, addSuffix: true })}
                  </span>
                </p>
                <p className="text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        )}

        {openReply && (
          <div className="space-y-2">
            <Textarea rows={2} placeholder="Répondre…" value={reply} onChange={(e) => setReply(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpenReply(false)}>Annuler</Button>
              <Button size="sm" disabled={!reply.trim() || replyM.isPending} onClick={() => replyM.mutate()}>Envoyer</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

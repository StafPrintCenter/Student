import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MessagesSquare } from "lucide-react";

import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeletePostDialog } from "@/components/portal/community/delete-post-dialog";
import { EditPostDialog } from "@/components/portal/community/edit-post-dialog";
import { HiddenPostAlert } from "@/components/portal/community/hidden-post-alert";
import { PostDetailCard } from "@/components/portal/community/post-detail-card";
import { PostInfoCard } from "@/components/portal/community/post-info-card";
import { useCommunityPostDetail } from "@/stores/useCommunityPostsStore";

export const Route = createFileRoute("/_student/community/$id")({
  head: () => ({
    meta: [
      { title: "Publication - STAF Student Portal" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityPostPage,
});

function BackButton() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to="/community">
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la communauté
      </Link>
    </Button>
  );
}

function CommunityPostPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: post, isLoading } = useCommunityPostDetail(id);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  if (!post) {
    return (
      <div className="space-y-6">
        <BackButton />
        <EmptyState
          icon={MessagesSquare}
          title="Publication introuvable"
          description="Elle a peut-être été supprimée, ou elle appartient à une formation dont vous n'êtes pas membre."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />

      {post.status === "hidden" && <HiddenPostAlert reason={post.hiddenReason} hiddenAt={post.hiddenAt} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PostDetailCard post={post} onEdit={() => setEditing(true)} onDelete={() => setDeleting(true)} />
        </div>
        <PostInfoCard post={post} />
      </div>

      {editing && <EditPostDialog postId={post.id} onClose={() => setEditing(false)} />}
      {deleting && (
        <DeletePostDialog
          post={post}
          onClose={() => setDeleting(false)}
          onDeleted={() => navigate({ to: "/community" })}
        />
      )}
    </div>
  );
}
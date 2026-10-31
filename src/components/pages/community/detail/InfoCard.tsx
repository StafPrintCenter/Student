import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fullDate, CategoryBadge } from "@/components/pages/community/shared";
import { PostStats } from "@/components/portal/community/post-meta";
import type { APICommunityPostDetail } from "@/data/community";

export function PostInfoCard({ post }: { post: APICommunityPostDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Row label="Catégorie">
          <CategoryBadge category={post.category} />
        </Row>
        <Row label="Espace">
          {post.training ? (
            <Link to="/trainings/$id/mine" params={{ id: post.training.id }} className="text-right hover:underline">
              {post.training.title}
            </Link>
          ) : (
            "Communauté générale"
          )}
        </Row>
        <Row label="Publiée le">{fullDate(post.createdAt)}</Row>
        {post.editedAt && <Row label="Modifiée le">{fullDate(post.editedAt)}</Row>}

        <div className="space-y-2 border-t pt-4">
          <p className="text-xs text-muted-foreground">Activité</p>
          <PostStats post={post} />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}
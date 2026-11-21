import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { APICommunityPostDetail } from "@/data/community";
import { cn } from "@/lib/utils";
import { useVoteCommunityPoll } from "@/stores/useCommunityPostsStore";

export function PollCard({ post }: { post: APICommunityPostDetail }) {
  const poll = post.poll;
  const [selectedOption, setSelectedOption] = useState("");
  const voteMutation = useVoteCommunityPoll();

  if (post.type !== "poll" || !poll) return null;

  const hasVoted = poll.myVote !== null;
  const canVote = post.status === "published" && !hasVoted;

  const submitVote = () => {
    if (!selectedOption || !canVote) return;
    voteMutation.mutate(
      { postId: post.id, optionId: selectedOption },
      {
        onSuccess: () => toast.success("Votre vote a été enregistré."),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Erreur lors de l'enregistrement de votre vote"),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="font-medium">Sondage</h2>
          <p className="text-xs text-muted-foreground">
            {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
          </p>
        </div>

        <fieldset className="space-y-3" disabled={!canVote || voteMutation.isPending}>
          <legend className="sr-only">Choisissez une option</legend>
          {poll.options.map((option) => {
            const percentage = poll.totalVotes > 0 ? Math.round((option.votesCount / poll.totalVotes) * 100) : 0;
            const isMyVote = poll.myVote === option.id;
            const isSelected = selectedOption === option.id || isMyVote;

            return (
              <label
                key={option.id}
                className={cn(
                  "block space-y-1.5 rounded-md border p-3 transition-colors has-disabled:cursor-not-allowed",
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-background",
                )}
              >
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`poll-${post.id}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedOption(option.id)}
                    disabled={!canVote || voteMutation.isPending}
                  />
                  {isMyVote && <span className="font-medium text-primary">Votre vote</span>}
                  <span className="flex-1">{option.label}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {option.votesCount} ({percentage}%)
                  </span>
                </span>
                <span
                  className="block h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label={`${percentage}% des votes`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentage}
                >
                  <span className="block h-full bg-primary" style={{ width: `${percentage}%` }} />
                </span>
              </label>
            );
          })}
        </fieldset>

        {canVote ? (
          <Button type="button" disabled={!selectedOption || voteMutation.isPending} onClick={submitVote}>
            {voteMutation.isPending ? "Enregistrement…" : "Voter"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            {hasVoted ? "Votre vote a été enregistré." : "Ce sondage n’accepte plus de votes."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

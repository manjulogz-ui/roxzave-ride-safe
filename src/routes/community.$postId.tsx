import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/community/$postId")({
  component: CommunityDetailPage,
});

function CommunityDetailPage() {
  const { postId } = Route.useParams();
  const [comment, setComment] = useState("");
  const qc = useQueryClient();

  const { data: post } = useQuery({
    queryKey: ["community-post", postId],
    queryFn: async () => (await api.get(`/api/community/posts/${postId}`)).data,
  });

  const { data: comments } = useQuery({
    queryKey: ["community-comments", postId],
    queryFn: async () => (await api.get(`/api/community/posts/${postId}/comments`)).data,
  });

  const verify = useMutation({
    mutationFn: () => api.post(`/api/community/posts/${postId}/verify`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-post", postId] }),
  });

  const addComment = useMutation({
    mutationFn: () => api.post(`/api/community/posts/${postId}/comments`, { body: comment }),
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["community-comments", postId] });
    },
  });

  return (
    <MobileShell>
      <PageHeader title={post?.community_name ?? "Community"} backTo="/community" />
      <article className="glass mt-4 rounded-2xl p-4">
        <p className="text-sm font-bold">{post?.title}</p>
        <p className="mt-2 text-[12px] text-muted-foreground">{post?.body}</p>
        <div className="mt-4 flex gap-3">
          <Button size="sm" onClick={() => verify.mutate()}>↑ Verify ({post?.verify_count ?? 0})</Button>
          <Button size="sm" variant="outline">Share</Button>
          <Button size="sm" variant="ghost">Report</Button>
        </div>
      </article>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comments</p>
        <div className="mt-2 space-y-2">
          {(comments ?? []).map((c: { id: string; body: string; author: string }) => (
            <div key={c.id} className="glass rounded-xl p-3 text-[12px]">
              <p className="font-bold">{c.author}</p>
              <p className="text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addComment.mutate();
          }}
        >
          <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comment…" />
          <Button type="submit" size="sm">Post</Button>
        </form>
      </div>
    </MobileShell>
  );
}

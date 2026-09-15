'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api-client.js';
import { queryClient } from '../../lib/query-client.js';
import { useAuthStore } from '../../lib/store/auth.store.js';
import { Button } from '../ui/button.js';
import { Textarea } from '../ui/textarea.js';
import { Avatar, AvatarFallback } from '../ui/avatar.js';
import { formatTimeAgo } from '../../lib/utils.js';
import { MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface CommentThreadProps {
  taskId: string;
}

export function CommentThread({ taskId }: CommentThreadProps) {
  const { user } = useAuthStore();
  const [content, setContent] = React.useState('');

  const { data: comments = [], isLoading } = useQuery<CommentItem[]>({
    queryKey: ['comments', taskId],
    queryFn: () => api.get<CommentItem[]>(`/comments?taskId=${taskId}`),
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => api.post('/comments', { taskId, content: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setContent('');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addCommentMutation.mutate(content.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
        <MessageSquare className="h-4 w-4 text-blue-400" />
        Activity & Comments ({comments.length})
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave a comment, technical update, or mention a teammate..."
          className="min-h-[70px] text-xs resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            variant="gradient"
            disabled={!content.trim() || addCommentMutation.isPending}
            className="text-xs h-8 px-3"
          >
            {addCommentMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Send className="h-3 w-3 mr-1.5" /> Post Comment
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {isLoading ? (
          <div className="text-xs text-muted-foreground text-center py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-lg">
            No comments yet. Start the conversation!
          </div>
        ) : (
          comments.map((c) => {
            const isAuthor = user?.id === c.author.id;
            return (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-card/60 border border-border/60 group">
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {c.author.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{c.author.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{formatTimeAgo(c.createdAt)}</span>
                      {isAuthor && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(c.id)}
                          className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

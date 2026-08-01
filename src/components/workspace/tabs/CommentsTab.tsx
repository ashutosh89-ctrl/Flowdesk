'use client';
import React, { useState } from 'react';
import { Comment, User } from '@/lib/types';
import { Send, Loader2, Reply, MessageSquare } from 'lucide-react';

interface CommentsTabProps {
  comments: Comment[];
  user: User | null;
  newCommentText: string;
  setNewCommentText: (val: string) => void;
  commentLoading: boolean;
  onSendComment: (e: React.FormEvent, parentId?: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
         date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function CommentsTab({
  comments,
  user,
  newCommentText,
  setNewCommentText,
  commentLoading,
  onSendComment
}: CommentsTabProps) {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Group top-level comments and replies
  const topLevelComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onSendComment(e, replyingToId || undefined);
    setReplyingToId(null);
  };

  const renderCommentBubble = (comm: Comment, isReply = false) => {
    const isOwn = comm.userId === user?.id || comm.authorId === user?.id;
    const authorName = comm.userName || (comm.authorRole === 'freelancer' ? 'Freelancer' : 'Client');
    const roleBadge = comm.authorRole || (isOwn ? 'freelancer' : 'client');

    return (
      <div key={comm.id} className={`flex gap-3 text-xs ${isOwn ? 'flex-row-reverse' : ''} ${isReply ? 'ml-8 mt-2' : 'mt-3'}`}>
        <img
          src={comm.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`}
          alt={authorName}
          className="w-7 h-7 rounded-full border border-black/5 object-cover bg-gray-50 shrink-0 mt-0.5"
          referrerPolicy="no-referrer"
        />
        <div className={`p-3.5 rounded-2xl max-w-[85%] space-y-1.5 shadow-2xs ${
          isOwn 
            ? 'bg-gray-950 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-900 rounded-tl-none border border-black/5'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-xs ${isOwn ? 'text-white' : 'text-gray-950'}`}>{authorName}</span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
              roleBadge === 'freelancer' 
                ? (isOwn ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800') 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {roleBadge}
            </span>
            <span className={`text-[10px] ${isOwn ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatRelativeTime(comm.createdAt)}
            </span>
          </div>

          <p className="text-xs leading-relaxed font-medium whitespace-pre-wrap">{comm.content}</p>

          {!isReply && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setReplyingToId(comm.id === replyingToId ? null : comm.id)}
                className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  isOwn ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Reply className="w-3 h-3" /> Reply
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-gray-950">Workspace Discussion Thread</h3>
        <p className="text-xs font-bold text-gray-400 mt-1">Asynchronous client workspace messaging & notes.</p>
      </div>

      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-700">No comments yet. Start the discussion.</p>
            <p className="text-[11px] text-gray-400">Post a message below to communicate asynchronously with your client.</p>
          </div>
        ) : (
          topLevelComments.map((parent) => {
            const replies = getReplies(parent.id);
            return (
              <div key={parent.id} className="space-y-1">
                {renderCommentBubble(parent, false)}
                {replies.map(reply => renderCommentBubble(reply, true))}
              </div>
            );
          })
        )}
      </div>

      {replyingToId && (
        <div className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200/60 p-2.5 px-4 rounded-xl text-amber-900 font-medium">
          <span>Replying to comment...</span>
          <button onClick={() => setReplyingToId(null)} className="font-bold text-amber-700 hover:text-amber-950 cursor-pointer">
            Cancel Reply
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-black/5">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder={replyingToId ? "Write a reply..." : "Type a message or note..."}
          className="flex-1 bg-gray-50 border border-black/10 rounded-full px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-gray-950"
        />
        <button
          type="submit"
          disabled={commentLoading || !newCommentText.trim()}
          className="px-4 py-2.5 bg-gray-950 hover:bg-gray-800 disabled:opacity-50 text-white rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          {commentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send
        </button>
      </form>
    </div>
  );
}

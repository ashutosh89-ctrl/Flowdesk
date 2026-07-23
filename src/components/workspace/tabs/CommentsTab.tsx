'use client';
import React from 'react';
import { Comment, User } from '@/lib/types';
import { Send, Loader2 } from 'lucide-react';

interface CommentsTabProps {
  comments: Comment[];
  user: User | null;
  newCommentText: string;
  setNewCommentText: (val: string) => void;
  commentLoading: boolean;
  onSendComment: (e: React.FormEvent) => void;
}

export function CommentsTab({
  comments,
  user,
  newCommentText,
  setNewCommentText,
  commentLoading,
  onSendComment
}: CommentsTabProps) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-gray-950">Workspace Discussion Thread</h3>
        <p className="text-xs font-bold text-gray-400 mt-1">Real-time asynchronous feedback & messaging.</p>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold py-8 text-center">No discussion messages yet.</p>
        ) : (
          comments.map((comm) => {
            const isOwn = comm.userId === user?.id;
            return (
              <div key={comm.id} className={`flex gap-3 text-xs ${isOwn ? 'flex-row-reverse' : ''}`}>
                <img
                  src={comm.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comm.userName)}`}
                  alt={comm.userName}
                  className="w-8 h-8 rounded-full border border-black/5 object-cover bg-gray-50 shrink-0"
                />
                <div className={`p-3.5 rounded-2xl max-w-[80%] space-y-1 ${
                  isOwn ? 'bg-gray-950 text-white rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${isOwn ? 'text-gray-200' : 'text-gray-900'}`}>{comm.userName}</span>
                    <span className={`text-[10px] ${isOwn ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{comm.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={onSendComment} className="flex gap-2 pt-2 border-t border-black/5">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Type a message or note..."
          className="flex-1 bg-gray-50 border border-black/10 rounded-full px-4 py-2 text-xs font-semibold focus:outline-none focus:border-gray-950"
        />
        <button
          type="submit"
          disabled={commentLoading || !newCommentText.trim()}
          className="px-4 py-2 bg-gray-950 hover:bg-gray-800 disabled:opacity-50 text-white rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          {commentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send
        </button>
      </form>
    </div>
  );
}

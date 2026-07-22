'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { readAll } from '@/lib/services/dataService';
import { getComments, addComment } from '@/lib/services/commentService';
import { Client, Project, Comment } from '@/lib/types';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function CommentsClient() {
  const { user, addToast } = useApp();
  
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const cls = await readAll<Client>('clients');
      const foundClient = cls.find(c => c.email.toLowerCase() === user.email.toLowerCase());
      if (foundClient) {
        setClient(foundClient);

        const projs = await readAll<Project>('projects');
        const proj = projs.find(p => p.clientId === foundClient.id);
        if (proj) {
          setProject(proj);
          const comms = await getComments(proj.id);
          setComments(comms.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !project || !user) return;

    setLoading(true);
    try {
      const added = await addComment({
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: newCommentText
      });
      setComments(prev => [...prev, added]);
      setNewCommentText('');
      addToast('Message posted successfully!', 'success');
      await loadData();
    } catch (e) {
      addToast('Failed to post message', 'warning');
    } finally {
      setLoading(false);
    }
  };

  if (!client || !project) {
    return <div className="p-8 text-center text-xs font-semibold text-gray-405">Loading workspace comments...</div>;
  }

  return (
    <div className="p-6 flex flex-col font-sans h-full overflow-hidden">
      <div className="border-b border-black/5 pb-4 shrink-0">
        <h2 className="text-xl font-bold text-gray-950">Workspace Discussions</h2>
        <p className="text-xs text-gray-550 font-semibold mt-0.5">Discuss project deliverables, requirements, and checkpoints directly with Ann.</p>
      </div>

      <div className="flex-1 overflow-auto py-6 space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 font-semibold text-center py-12 bg-white border border-black/5 rounded-2xl">No discussion threads started yet.</p>
        ) : (
          comments.map((comm) => (
            <div key={comm.id} className="flex gap-3 text-xs leading-normal">
              <img
                src={comm.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comm.userName)}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-black/5 object-cover shrink-0"
              />
              <div className="bg-white border border-black/5 p-3 rounded-2xl max-w-lg shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-gray-950">{comm.userName}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">
                    {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">{comm.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-black/5 bg-gray-50/50 rounded-2xl flex gap-3 shrink-0">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Discuss updates or ask questions..."
          className="flex-1 h-10 px-4 bg-white border border-black/10 rounded-full text-xs font-semibold focus:outline-none focus:border-gray-900"
          required
        />
        <button
          type="submit"
          disabled={loading || !newCommentText.trim()}
          className="px-4 h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

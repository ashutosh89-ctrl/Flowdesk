import { Comment, Project } from '../types';
import { create, readAll } from './dataService';
import { logActivity } from './activityService';

export interface AddCommentInput {
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
}

export async function getComments(projectId: string): Promise<Comment[]> {
  const allComments = await readAll<Comment>('comments');
  return allComments.filter(c => c.projectId === projectId);
}

export async function addComment(data: AddCommentInput, onNewCommentCallback?: (c: Comment) => void): Promise<Comment> {
  const newComment: Comment = {
    id: `comm_${Math.random().toString(36).substring(2, 9)}`,
    projectId: data.projectId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    content: data.content,
    createdAt: new Date().toISOString()
  };

  const saved = await create<Comment>('comments', newComment);

  // Find workspace to log activity
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === data.projectId);
  if (proj) {
    const workspaces = await readAll<any>('workspaces');
    const ws = workspaces.find(w => w.clientId === proj.clientId);
    if (ws) {
      await logActivity({
        workspaceId: ws.id,
        type: 'comment_added',
        description: `${data.userName} added a comment to project ${proj.name}`
      });
    }
  }
  return saved;
}

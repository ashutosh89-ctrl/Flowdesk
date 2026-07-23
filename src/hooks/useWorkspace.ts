'use client';
import { useState, useEffect } from 'react';

export function useWorkspace(workspaceId: string) {
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/workspaces/${workspaceId}`)
      .then(r => r.json())
      .then(data => {
        setWorkspace(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workspaceId]);
  
  return { workspace, loading };
}

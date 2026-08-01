import { getSession } from '@/lib/supabase/server';
import { readAll } from '@/lib/services/dataService';
import { ProjectsClient } from '@/components/projects/ProjectsClient';
import { redirect } from 'next/navigation';
import { Project, Client } from '@/lib/types';

export default async function FreelancerProjectsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const allClients = await readAll<Client>('clients', session.id);
  const clientIds = allClients.map(c => c.id);
  
  const allProjects = await readAll<Project>('projects', session.id);
  const projects = allProjects.filter(p => clientIds.includes(p.clientId));


  return (
    <ProjectsClient 
      initialProjects={projects}
      initialClients={allClients}
    />
  );
}

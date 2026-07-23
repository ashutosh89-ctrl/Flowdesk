"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Project, Client } from '../../lib/types';
import CreateProjectModal from './CreateProjectModal';
import ProjectDetail from './ProjectDetail';
import { 
  Plus, Search, Grid, List, Calendar, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectsClientProps {
  initialProjects: Project[];
  initialClients: Client[];
}

export function ProjectsClient({ initialProjects, initialClients }: ProjectsClientProps) {
  const { 
    isCreateProjectOpen, setCreateProjectOpen 
  } = useApp();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadData = async () => {
    try {
      const projRes = await fetch('/api/projects');
      const projs = await projRes.json();
      setProjects(projs);
      
      const clsRes = await fetch('/api/clients');
      const cls = await clsRes.json();
      setClients(cls);
    } catch (e) {}
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c ? `${c.name} (${c.company})` : 'Unknown Client';
  };

  const filteredProjects = projects.filter(p => {
    const clientName = getClientName(p.clientId).toLowerCase();
    return p.name.toLowerCase().includes(search.toLowerCase()) || clientName.includes(search.toLowerCase());
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'review':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-black/5 bg-white/30 backdrop-blur-md shrink-0">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by name or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-black/5 rounded-full text-xs font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-black/10 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setCreateProjectOpen(true)}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length === 0 ? (
              <p className="col-span-full py-12 text-center text-xs font-semibold text-gray-455">No projects found.</p>
            ) : (
              filteredProjects.map((proj, idx) => (
                <motion.div
                  key={proj.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedProject(proj)}
                  className="bg-white rounded-2xl border border-black/5 p-6 hover:shadow-md transition-all cursor-pointer space-y-4 group relative"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-white/60 pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(proj.status)}`}>
                      {proj.status.replace('_', ' ')}
                    </span>
                    {proj.dueDate && (
                      <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(proj.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-gray-950 leading-snug group-hover:text-black line-clamp-1">{proj.name}</h3>
                    <p className="text-xs text-gray-455 font-bold mt-1">{getClientName(proj.clientId)}</p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                      <span>Progress</span>
                      <span>{proj.progress}%</span>
                    </div>
                    <div className="flex gap-1.5">
                      {['planning', 'in_progress', 'review', 'completed'].map((stage, i) => {
                        const stageIndexMap: Record<string, number> = { planning: 0, in_progress: 1, review: 2, completed: 3 };
                        const projectStageIndex = stageIndexMap[proj.status];
                        
                        let fillClass = 'bg-gray-200';
                        if (i < projectStageIndex) {
                          fillClass = 'bg-gray-950';
                        } else if (i === projectStageIndex) {
                          fillClass = 'bg-gray-950/50';
                        } else if (proj.status === 'completed') {
                          fillClass = 'bg-gray-950';
                        }
                        
                        return (
                          <div
                            key={stage}
                            className={`h-2 flex-1 rounded-full ${fillClass} transition-all duration-500`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/40">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs font-semibold text-gray-400">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((proj) => (
                    <tr
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4.5 text-sm font-bold text-gray-950 truncate max-w-[200px]">
                        {proj.name}
                      </td>
                      <td className="px-6 py-4.5 text-xs font-semibold text-gray-650">
                        {getClientName(proj.clientId)}
                      </td>
                      <td className="px-6 py-4.5 text-xs font-semibold text-gray-400">
                        {proj.dueDate ? new Date(proj.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(proj.status)}`}>
                          {proj.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                            <div className="bg-gray-900 h-full rounded-full w-[var(--p)]" style={{ '--p': `${proj.progress}%` } as React.CSSProperties} />
                          </div>
                          <span className="text-[11px] font-bold text-gray-600">{proj.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-gray-900 inline-block transition-transform group-hover:translate-x-0.5" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isCreateProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onSuccess={loadData}
      />

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail 
            project={selectedProject}
            isOpen={!!selectedProject}
            onClose={() => {
              setSelectedProject(null);
              loadData();
            }}
            onSuccess={loadData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

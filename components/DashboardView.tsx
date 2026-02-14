/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";

import React, { useMemo, useState } from "react";
import type { Note, Project } from "../types";
import { PlusIcon, SearchIcon, ArrowRightIcon, DocumentTextIcon } from "./IconComponents";
import { ProjectCard } from "./ProjectCard";
import { NewsDropdown } from "./NewsDropdown";
import { SocialCardModal } from "./SocialCardModal";
import { CareerRoadmapModal } from "./CareerRoadmapModal";

type SortMode = "newest" | "oldest" | "name";

interface DashboardViewProps {
  projects: Project[];
  filteredProjects: Project[];
  notes: Note[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateProject: () => void;
  onEditProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onNavigate: (view: "dashboard" | "notes" | "settings" | "profile") => void;
  displayName?: string;
}

export default function DashboardView({
  projects,
  filteredProjects,
  notes,
  searchQuery,
  onSearchChange,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onNavigate,
  displayName,
}: DashboardViewProps) {
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [socialCardProject, setSocialCardProject] = useState<Project | null>(null);
  const [isCareerRoadmapOpen, setIsCareerRoadmapOpen] = useState(false);

  const tagCount = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      (p.tags || []).forEach((t) => set.add(t));
    }
    return set.size;
  }, [projects]);

  const sortedProjects = useMemo(() => {
    const arr = [...filteredProjects];
    if (sortMode === "name") {
      arr.sort((a, b) => (a.projectName || "").localeCompare(b.projectName || ""));
      return arr;
    }
    if (sortMode === "oldest") return arr.reverse();
    return arr;
  }, [filteredProjects, sortMode]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-black border border-white/10 overflow-hidden relative">
      
      {/* Top Bar / Hero */}
      <div className="shrink-0 p-4 sm:p-5 md:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6 bg-[#0d0d0d] z-20">
         <div className="space-y-1.5 sm:space-y-2 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-boldonse uppercase text-white tracking-widest leading-tight">
              {displayName ? `HELLO, ${displayName}` : "DASHBOARD"}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-white/40 font-mono text-[10px] uppercase tracking-widest">
               <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
               <span>System Online</span>
               <span className="text-white/20">|</span>
               <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
               <span className="text-white/20 hidden md:inline">|</span>
               <div className="relative inline-block">
                  <button
                     onClick={() => setIsNewsOpen((v) => !v)}
                     className="hover:text-white transition-colors flex items-center gap-2"
                  >
                     <span>Updates</span>
                     <span className={`w-1.5 h-1.5 rounded-full ${isNewsOpen ? 'bg-red-500' : 'bg-red-500 animate-pulse'}`}></span>
                  </button>
                  <NewsDropdown isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />
               </div>
            </div>
         </div>

         <div className="flex flex-wrap gap-2">
             <button
                onClick={() => setIsCareerRoadmapOpen(true)}
                className="group flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-all"
             >
                <img src="/Brand Logo Icon.ico" alt="AI" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>AI Career Advice</span>
             </button>
             <button
                onClick={onCreateProject}
                className="group flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 bg-white hover:bg-white/90 text-black text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-all"
             >
                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform" />
                <span>New Project</span>
             </button>
             <button
                onClick={() => onNavigate("notes")}
                className="flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 border border-white/10 hover:bg-white text-white hover:text-black text-[10px] sm:text-xs font-mono uppercase tracking-widest transition-all"
             >
                <DocumentTextIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Notes</span>
             </button>
         </div>
      </div>

      <SocialCardModal 
        project={socialCardProject} 
        onClose={() => setSocialCardProject(null)} 
      />

      {isCareerRoadmapOpen && (
          <CareerRoadmapModal 
            projects={projects} 
            onClose={() => setIsCareerRoadmapOpen(false)} 
          />
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 md:p-6 bg-black relative z-10">
         <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-16 sm:pb-20">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/10 bg-black">
               <div className="p-4 sm:p-5 md:p-6 border-r border-b md:border-b-0 border-white/10 hover:bg-white/5 transition-colors group">
                  <p className="font-mono text-[10px] uppercase text-white/40 mb-1 sm:mb-2">Total Projects</p>
                  <p className="text-2xl sm:text-3xl font-boldonse text-white tracking-wide leading-tight">{projects.length.toString().padStart(2, '0')}</p>
               </div>
               <div className="p-4 sm:p-5 md:p-6 border-r border-b md:border-b-0 border-white/10 hover:bg-white/5 transition-colors group">
                  <p className="font-mono text-[10px] uppercase text-white/40 mb-1 sm:mb-2">Active Notes</p>
                  <p className="text-2xl sm:text-3xl font-boldonse text-white tracking-wide leading-tight">{notes.length.toString().padStart(2, '0')}</p>
               </div>
                <div className="p-4 sm:p-5 md:p-6 border-r border-white/10 hover:bg-white/5 transition-colors group">
                  <p className="font-mono text-[10px] uppercase text-white/40 mb-1 sm:mb-2">Tech Tags</p>
                  <p className="text-2xl sm:text-3xl font-boldonse text-white tracking-wide leading-tight">{tagCount.toString().padStart(2, '0')}</p>
               </div>
               <div className="p-4 sm:p-5 md:p-6 hover:bg-white/5 transition-colors group">
                  <p className="font-mono text-[10px] uppercase text-white/40 mb-1 sm:mb-2">Deployment</p>
                  <p className="text-base sm:text-lg font-boldonse text-green-500 uppercase tracking-wide flex items-center gap-2 leading-tight">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" aria-hidden />
                     Stable
                  </p>
               </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
               <div className="flex-1 flex border border-white/10 bg-black min-w-0">
                  <div className="p-2.5 sm:p-3 border-r border-white/10 flex items-center justify-center text-white/40 shrink-0">
                     <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="SEARCH DATABASE..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-white font-mono text-xs uppercase placeholder-white/20 focus:outline-none w-full min-w-0"
                  />
               </div>
               <div className="flex items-center bg-black border border-white/10 px-3 sm:px-4 py-2.5 sm:py-0 shrink-0">
                  <span className="text-[10px] font-mono uppercase text-white/40 mr-2 sm:mr-3">Sort:</span>
                  <select
                     value={sortMode}
                     onChange={(e) => setSortMode(e.target.value as SortMode)}
                     className="bg-transparent text-white font-mono text-xs uppercase focus:outline-none cursor-pointer py-2 sm:py-3"
                  >
                     <option value="newest" className="bg-black text-white">Newest</option>
                     <option value="oldest" className="bg-black text-white">Oldest</option>
                     <option value="name" className="bg-black text-white">Name</option>
                  </select>
               </div>
            </div>

            {/* Projects Grid */}
            <div className="space-y-4">
               <div className="flex items-center justify-between text-white/40 border-b border-white/10 pb-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest">Project Database</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest">Count: {sortedProjects.length}</span>
               </div>

               {projects.length === 0 ? (
                  <div className="border border-white/10 border-dashed p-12 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group" onClick={onCreateProject}>
                     <div className="w-16 h-16 border border-white/20 flex items-center justify-center mb-6 group-hover:border-white transition-colors">
                        <PlusIcon className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                     </div>
                     <h3 className="text-2xl font-boldonse text-white uppercase tracking-widest mb-2">Empty Database</h3>
                     <p className="font-mono text-xs text-white/40 max-w-sm uppercase tracking-wide">Initiate your first project to populate the grid.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                     {/* Create New Card */}
                     <button
                        onClick={onCreateProject}
                        className="group relative min-h-[300px] sm:h-[340px] md:h-[380px] border border-white/10 bg-black flex flex-col p-5 sm:p-6 md:p-8 transition-all hover:border-white/40 text-left overflow-hidden"
                     >
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 group-hover:opacity-10 pointer-events-none" aria-hidden />
                        <div className="flex-1 relative z-10 min-h-0 flex flex-col">
                           <div className="w-10 h-10 sm:w-12 sm:h-12 border border-white/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                           </div>
                           <h3 className="text-xl sm:text-2xl font-boldonse text-white uppercase tracking-widest mb-1.5 sm:mb-2 leading-tight">Initialize New</h3>
                           <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                              Create a new project entry with AI-assisted documentation.
                           </p>
                        </div>
                        <div className="flex items-center gap-2 mt-auto text-white/40 group-hover:text-white transition-colors shrink-0 pt-2">
                           <span className="font-mono text-[10px] uppercase tracking-widest">Launch Editor</span>
                           <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                     </button>

                     {sortedProjects.map((project) => (
                        <ProjectCard
                           key={project.id}
                           project={project}
                           onEdit={onEditProject}
                           onDelete={onDeleteProject}
                           onShare={() => setSocialCardProject(project)}
                        />
                     ))}
                  </div>
               )}
            </div>

         </div>
      </div>
    </div>
  );
}


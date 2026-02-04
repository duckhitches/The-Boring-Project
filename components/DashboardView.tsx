/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";

import React, { useMemo, useState } from "react";
import type { Note, Project } from "../types";
import { PlusIcon, SearchIcon, ArrowRightIcon } from "./IconComponents";
import { ProjectCard } from "./ProjectCard";
import { NewsDropdown } from "./NewsDropdown";

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
      <div className="shrink-0 p-6 border-b border-white/10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 bg-[#0d0d0d] z-20">
         <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-boldonse uppercase text-white tracking-widest leading-none">
              {displayName ? `HELLO, ${displayName}` : "DASHBOARD"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-white/40 font-mono text-[10px] uppercase tracking-widest">
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
                onClick={onCreateProject}
                className="group flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black text-xs font-mono uppercase tracking-widest transition-all"
             >
                <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span>New Project</span>
             </button>
             <button
                onClick={() => onNavigate("notes")}
                className="flex items-center gap-2 px-6 py-3 border border-white/10 hover:bg-white text-white hover:text-black text-xs font-mono uppercase tracking-widest transition-all"
             >
                <span>Notes</span>
             </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black relative z-10">
         <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/10 bg-black">
               <div className="p-6 border-r border-b md:border-b-0 border-white/10 hover:bg-white/5 transition-colors group">
                  <p className="font-mono text-[10px] uppercase text-white/40 mb-2">Total Projects</p>
                  <p className="text-3xl font-boldonse text-white tracking-wide">{projects.length.toString().padStart(2, '0')}</p>
               </div>
               <div className="p-6 border-r border-b md:border-b-0 border-white/10 hover:bg-white/5 transition-colors group">
                  <p className="font-mono text-[10px] uppercase text-white/40 mb-2">Active Notes</p>
                  <p className="text-3xl font-boldonse text-white tracking-wide">{notes.length.toString().padStart(2, '0')}</p>
               </div>
                <div className="p-6 border-r border-white/10 hover:bg-white/5 transition-colors group">
                  <p className="font-mono text-[10px] uppercase text-white/40 mb-2">Tech Tags</p>
                  <p className="text-3xl font-boldonse text-white tracking-wide">{tagCount.toString().padStart(2, '0')}</p>
               </div>
               <div className="p-6 hover:bg-white/5 transition-colors group">
                  <p className="font-mono text-[10px] uppercase text-white/40 mb-2">Deployment</p>
                  <p className="text-lg font-boldonse text-green-500 uppercase tracking-wide flex items-center gap-2">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     Stable
                  </p>
               </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
               {/* Search */}
               <div className="flex-1 flex border border-white/10 bg-black">
                  <div className="p-3 border-r border-white/10 flex items-center justify-center text-white/40">
                     <SearchIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="SEARCH DATABASE..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-3 text-white font-mono text-xs uppercase placeholder-white/20 focus:outline-none w-full min-w-0"
                  />
               </div>
               
               {/* Sort - Simplified without News Feed */}
               <div className="flex items-center bg-black border border-white/10 px-4 shrink-0">
                  <span className="text-[10px] font-mono uppercase text-white/40 mr-3">Sort:</span>
                  <select
                     value={sortMode}
                     onChange={(e) => setSortMode(e.target.value as SortMode)}
                     className="bg-transparent text-white font-mono text-xs uppercase focus:outline-none cursor-pointer"
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
                        className="group relative h-[380px] border border-white/10 bg-black flex flex-col p-8 transition-all hover:border-white/40 text-left overflow-hidden"
                     >
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 group-hover:opacity-10 pointer-events-none"></div>
                        <div className="flex-1 relative z-10">
                           <div className="w-12 h-12 border border-white/20 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                              <PlusIcon className="w-5 h-5" />
                           </div>
                           <h3 className="text-2xl font-boldonse text-white uppercase tracking-widest mb-2">Initialize New</h3>
                           <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                              Create a new project entry with AI-assisted documentation.
                           </p>
                        </div>
                        <div className="flex items-center gap-2 mt-auto text-white/40 group-hover:text-white transition-colors">
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


/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjectWithUserInfo } from "../../../types";
import {
  GithubIcon,
  ExternalLinkIcon,
  MailIcon,
  ChevronLeftIcon
} from "../../../components/IconComponents";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import Loading from "../../../components/ui/loader";
import { generateProjectStructuredData } from "../../../lib/seo";

export default function PublicProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<ProjectWithUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/projects/${projectId}?t=${Date.now()}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Project not found");
          } else {
            setError("Failed to load project");
          }
          return;
        }

        const projectData = await response.json();
        setProject(projectData);
        
        const structuredData = generateProjectStructuredData(projectData, projectId);
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(structuredData);
        script.id = 'project-structured-data';
        const existingScript = document.getElementById('project-structured-data');
        if (existingScript) {
          existingScript.remove();
        }
        document.head.appendChild(script);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const codeElement = React.useMemo(() => {
    if (!project?.codeSnippet || !project?.codeLanguage) {
      return null;
    }

    const lang = project.codeLanguage;
    const grammar = Prism.languages[lang];
    const className = `language-${project.codeLanguage}`;

    if (grammar) {
      const html = Prism.highlight(project.codeSnippet, grammar, lang);
      return (
        <code
          className={className}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return <code className={className}>{project.codeSnippet}</code>;
  }, [project?.codeSnippet, project?.codeLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <div className="flex flex-col items-center gap-4 text-white/50">
             <Loading />
             <span className="font-mono text-xs uppercase tracking-widest animate-pulse">Initializing...</span>
          </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center border border-white/10 p-12 bg-black max-w-md w-full">
          <h1 className="text-3xl font-bold font-boldonse text-white mb-4 uppercase">
            Not Found
          </h1>
          <p className="text-white/50 font-mono text-sm mb-8 leading-relaxed">
            {error || "The project you are looking for does not exist."}
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 selection:text-white pb-20">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
           <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
              <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-mono text-xs uppercase tracking-widest">Back to Dashboard</span>
           </Link>
           <div className="flex items-center gap-3">
              <span className="text-white/20 font-mono text-[10px] uppercase hidden sm:block">Project ID: {project.id.slice(0, 8)}</span>
           </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 border-b border-white/10 pb-8"
        >
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                  <div className="flex items-center gap-3 mb-4">
                     <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                        {project.timeline || 'Ongoing'}
                     </span>
                     {project.userInfo && (
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                            BY {project.userInfo.firstName || 'ANON'}
                        </span>
                     )}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold font-boldonse text-white uppercase tracking-tight leading-none mb-2">
                    {project.projectName}
                  </h1>
                   {project.tags && (
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs font-mono text-white/50 uppercase">
                          {project.tags.map(tag => (
                             <span key={tag}>#{tag}</span>
                          ))}
                      </div>
                   )}
              </div>
              
              <div className="flex gap-3">
                 {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all group" title="View on GitHub">
                       <GithubIcon className="w-5 h-5" />
                    </a>
                 )}
                 {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all group" title="View Live Demo">
                       <ExternalLinkIcon className="w-5 h-5" />
                    </a>
                 )}
                 <a href={`mailto:${project.contactEmail}`} className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all group" title="Contact Developer">
                     <MailIcon className="w-5 h-5" />
                 </a>
              </div>
           </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content Info */}
            <motion.div 
               className="lg:col-span-2 space-y-12"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
            >
                {/* Hero Image */}
                <div className="relative aspect-video w-full bg-[#0d0d0d] border border-white/10 overflow-hidden group">
                     {project.backgroundImage ? (
                        <Image
                            src={project.backgroundImage}
                            alt={project.projectName}
                            fill
                            className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                            priority
                        />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505]">
                           <span className="font-boldonse text-6xl text-white/5 uppercase select-none">{project.projectName.slice(0,2)}</span>
                        </div>
                     )}
                     {/* Overlay Grid */}
                     <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>
                </div>

                {/* Description */}
                <section>
                    <h3 className="text-sm font-mono text-indigo-400 uppercase tracking-widest mb-6 border-l-2 border-indigo-500 pl-3">Project Overview</h3>
                    <article className="font-mono text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {project.description}
                    </article>
                </section>

                {/* Code Snippet */}
                {project.codeSnippet && (
                   <section>
                      <h3 className="text-sm font-mono text-indigo-400 uppercase tracking-widest mb-6 border-l-2 border-indigo-500 pl-3">Technical Highlight</h3>
                      <div className="relative bg-[#0d0d0d] border border-white/10 overflow-hidden group/code">
                           <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/50">
                               <div className="flex gap-1.5">
                                   <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                   <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                   <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                               </div>
                               <span className="text-[10px] font-mono text-white/30 uppercase">{project.codeLanguage || 'CODE'}</span>
                           </div>
                           <div className="p-0 overflow-x-auto relative">
                                <pre className="!bg-transparent !m-0 !p-6 text-xs font-mono leading-relaxed !text-indigo-100/80">
                                   {codeElement}
                                </pre>
                                {/* Scanline overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_2px,3px_100%] opacity-10"></div>
                           </div>
                      </div>
                   </section>
                )}
            </motion.div>

            {/* Sidebar Details */}
            <motion.aside 
               className="lg:col-span-1"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 }}
            >
               <div className="sticky top-24 space-y-8">
                   <div className="bg-[#0d0d0d] border border-white/10 p-6">
                       <h3 className="text-sm font-boldonse text-white uppercase mb-6 tracking-wide">Details</h3>
                       
                       <div className="space-y-6">
                           <div>
                               <label className="block text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Timeline</label>
                               <p className="font-mono text-xs text-white uppercase">{project.timeline || 'N/A'}</p>
                           </div>
                           <div>
                               <label className="block text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Status</label>
                               <div className="flex items-center gap-2">
                                   <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                   <p className="font-mono text-xs text-white uppercase">Active</p>
                               </div>
                           </div>
                            <div>
                               <label className="block text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1">Category</label>
                               <p className="font-mono text-xs text-white uppercase">Development</p>
                           </div>
                       </div>
                   </div>

                   {/* Footer Brand */}
                   <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all hover:opacity-100 invert-0">
                       <div className="w-10 h-10 bg-white rounded-full overflow-hidden p-0.5">
                           <Image src="/images/brand-logo.png" alt="Logo" width={40} height={40} className="w-full h-full object-cover bg-black rounded-full" />
                       </div>
                       <div>
                           <p className="font-boldonse text-sm text-white leading-none">THE BORING PROJECT</p>
                           <p className="font-mono text-[10px] text-white/60">EST. 2025</p>
                       </div>
                   </div>
               </div>
            </motion.aside>

        </div>
      </main>
    </div>
  );
}

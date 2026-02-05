/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProjectCard } from "./components/ProjectCard";
import { CreateCardModal } from "./components/CreateCardModal";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { VoiceCompanion } from "./components/VoiceCompanion";
import AuthModal from "./components/AuthModal";
import NotesView from "./components/NotesView";
import SettingsView from "./components/SettingsView";
import { ProfileSettings } from "./components/ProfileSettings";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import type { Project, Note } from "./types";
import { PlusIcon } from "./components/IconComponents";
import { ArrowRight, Axe, Code, Link, Rocket, Sparkles } from "lucide-react";
import Loading from "./components/ui/loader";
import { supabaseService } from "./services/supabaseService";
import { motion } from "framer-motion";
import { WorldMapDemo } from "./components/ui/WorldMap";
import ProjectPreviewGrid from "./components/ProjectPreviewGrid";
import FeatureShowcase from "./components/FeatureShowcase";
import DashboardView from "./components/DashboardView";
import AppShell from "./components/layout/AppShell";

export type View = "dashboard" | "notes" | "settings" | "profile";

const AppContent: React.FC = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);

  useEffect(() => {
    if (user) {
      if (!projectsLoaded) {
        loadProjects();
      }
      if (!notesLoaded) {
        loadNotes();
      }
      setShowLandingPage(false); // Hide landing page when user is authenticated
    } else if (!user) {
      setProjects([]);
      setNotes([]);
      setProjectsLoaded(false);
      setNotesLoaded(false);
      setIsLoading(false);
      setShowLandingPage(true); // Show landing page when user is not authenticated
    }
  }, [user, projectsLoaded, notesLoaded]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("active-view", currentView);
      } catch {}
    }
  }, [currentView]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const supabaseProjects = await supabaseService.getProjects();
      if (supabaseProjects.length > 0) setProjects(supabaseProjects);
      else fallbackSample();
      setProjectsLoaded(true);
    } catch (error) {
      console.error("Error loading projects:", error);
      fallbackSample();
      setProjectsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const supabaseNotes = await supabaseService.getNotes();
      setNotes(supabaseNotes);
      setNotesLoaded(true);
    } catch (error) {
      console.error("Error loading notes:", error);
      setNotesLoaded(true);
    }
  };

  const refreshProjects = useCallback(() => {
    setProjectsLoaded(false);
  }, []);

  const fallbackSample = () => {
    setProjects([
      {
        id: "1",
        projectName: "React Portfolio",
        timeline: "2 weeks",
        startDate: "2024-05-01",
        endDate: "2024-05-14",
        description:
          "A personal portfolio website built with React, showcasing my skills and projects.",
        codeSnippet: `const About = () => (<div><h1>About Me</h1><p>I'm a passionate developer...</p></div>)`,
        codeLanguage: "jsx",
        screenshots: ["https://picsum.photos/seed/project1/1600/900"],
        githubLink: "https://github.com",
        liveLink: "https://codepen.io",
        contactEmail: "developer@example.com",
        backgroundImage: "https://picsum.photos/seed/bg1/1000/600",
        tags: ["React", "JavaScript", "CSS"],
      },
    ]);
  };

  const handleAddProject = useCallback(
    async (newProject: Omit<Project, "id">) => {
      try {
        const saved = await supabaseService.createProject(newProject);
        const finalProj =
          saved ||
          ({
            ...newProject,
            id: `project_${Date.now()}_${Math.random()}`,
          } as Project);
        setProjects((prev) => [finalProj, ...prev]);
      } catch (error) {
        console.error("Error saving project:", error);
      } finally {
        setIsModalOpen(false);
      }
    },
    []
  );

  const handleUpdateProject = useCallback(async (updatedProject: Project) => {
    try {
      // Update in Supabase first
      const savedProject = await supabaseService.updateProject(
        updatedProject.id,
        updatedProject
      );

      if (savedProject) {
        // Update local state with the saved project
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProject.id ? savedProject : p))
        );
      } else {
        // Fallback: update local state even if Supabase fails
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        );
      }
    } catch (error) {
      console.error("Error updating project:", error);
      // Still update local state for better UX
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
    } finally {
      setProjectToEdit(null);
      setIsModalOpen(false);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!projectToDelete) return;
    try {
      const success = await supabaseService.deleteProject(projectToDelete.id);
      if (success)
        setProjects((p) => p.filter((x) => x.id !== projectToDelete.id));
    } catch {
      setProjects((p) => p.filter((x) => x.id !== projectToDelete.id));
    } finally {
      setProjectToDelete(null);
    }
  }, [projectToDelete]);

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) =>
        [p.projectName, p.description, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [projects, searchQuery]
  );

  const filteredNotes = useMemo(
    () =>
      notes.filter((n) =>
        [n.title, n.content]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [notes, searchQuery]
  );

  const handleGetStarted = () => {
    console.log("Get Started clicked!");
    router.push("/auth");
  };

  const renderView = () => {
    if (authLoading)
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loading />
          <p className="mt-3 text-neutral-400">Loading...</p>
        </div>
      );

    if (isLoading)
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loading />
          <p className="mt-3 text-neutral-400">Loading your projects...</p>
        </div>
      );

    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            projects={projects}
            filteredProjects={filteredProjects}
            notes={notes}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateProject={() => setIsModalOpen(true)}
            onEditProject={(id) => {
              const proj = projects.find((p) => p.id === id);
              if (proj) {
                setProjectToEdit(proj);
                setIsModalOpen(true);
              }
            }}
            onDeleteProject={(id) => {
              const proj = projects.find((p) => p.id === id);
              if (proj) setProjectToDelete(proj);
            }}
            onNavigate={setCurrentView}
            displayName={
              profile?.full_name ||
              profile?.first_name ||
              user?.user_metadata?.full_name ||
              user?.user_metadata?.first_name ||
              undefined
            }
          />
        );
      case "notes":
        return <NotesView searchQuery={searchQuery} />;
      case "settings":
        return <SettingsView />;
      case "profile":
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  {
    /* To implement: If user is authenticated, redirect to dashboard */
  }
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Loading />
      </div>
    );
  }

  // Show landing page for unauthenticated users only when NOT loading
  if (!user && !authLoading && showLandingPage) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center text-center px-4 md:px-6 pt-16 md:pt-24 pb-20 md:pb-32 bg-black overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:40px_40px] opacity-20 pointer-events-none" />
          
          {/* Sharp geometric accent */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-4xl"
          >
            {/* Logo */}
            <div className="flex justify-center mb-8 md:mb-10">
              <div className="relative p-4 border border-white/20 bg-black">
                <Image
                  src="/images/brand-logo.png"
                  alt="The Boring Project Logo"
                  width={80}
                  height={80}
                  className="w-auto h-auto grayscale"
                  priority
                  quality={100}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-7xl font-boldonse uppercase text-white tracking-widest mb-4 leading-tight">
              The Boring
              <span className="block text-white/40">Project</span>
            </h1>
            <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-white/50 mb-10 md:mb-12">
              The least boring place for devs
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
              <button
                onClick={handleGetStarted}
                className="group bg-white hover:bg-white/90 text-black px-8 md:px-10 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="border border-white/20 hover:bg-white hover:text-black text-white px-8 md:px-10 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-all"
              >
                <a 
                    href="https://portfolio-eshan-2z6t.vercel.app/boring-projects/the-boring-project"
                    className="flex items-center gap-2"
                >
                  Learn More
                </a>
              </button>
            </div>
          </motion.div>

          {/* Floating elements - made geometric */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-24 left-4 md:left-16 border border-white/10 p-2 bg-black/50"
          >
            <Image
              src="/brand-love.png"
              alt="Floating Illustration"
              width={80}
              height={80}
              className="opacity-40 md:opacity-60 md:w-[120px] md:h-[120px] grayscale"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            className="absolute bottom-16 right-4 md:right-16 border border-white/10 p-2 bg-black/50"
          >
            <Image
              src="/brand.png"
              alt="Floating Illustration"
              width={80}
              height={80}
              className="opacity-40 md:opacity-60 md:w-[120px] md:h-[120px] grayscale"
            />
          </motion.div>
          
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>

        {/* FEATURES SECTION */}
        <FeatureShowcase />
        {/* <section className="max-w-7xl mx-auto px-6 pb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            Why Choose <span className="text-indigo-400">The Boring Project?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="w-6 h-6 text-indigo-500" />,
                title: "Code Showcase",
                desc: "Highlight your best work with syntax highlighting and live previews.",
              },
              {
                icon: <Rocket className="w-6 h-6 text-indigo-500" />,
                title: "One-Click Share",
                desc: "Generate shareable project cards instantly for social media or your portfolio.",
              },
              {
                icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
                title: "Modern Aesthetics",
                desc: "Enjoy a beautiful, responsive interface with zero complexity.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-black/60 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/50 text-center backdrop-blur-md"
              >
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section> */}

        {/* WORLD MAP SECTION */}
        <section className="border-t border-b border-white/10 py-24">
          <div className="max-w-7xl mx-auto px-6">
            {/* <div className="text-center mb-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
                Network Status
              </p>
              <h2 className="text-3xl md:text-4xl font-boldonse uppercase text-white tracking-widest">
                Global Reach
              </h2>
            </div> */}
            <WorldMapDemo />
          </div>
        </section>

        {/* DEV SECTION */}
        <section id="about" className="py-24 bg-black">
          <div className="max-w-6xl mx-auto px-6">
            <div className="border border-white/10 bg-[#0a0a0a] grid md:grid-cols-2 items-stretch">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative h-72 md:h-auto min-h-[300px] overflow-hidden border-b md:border-b-0 md:border-r border-white/10"
              >
                <Image
                  src="/luffy-ace.jpg"
                  alt="Developer"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-white/30" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-white/30" />
              </motion.div>
              
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="p-8 md:p-12 flex flex-col justify-center"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
                  Creator Profile
                </p>
                <h3 className="text-2xl md:text-3xl font-boldonse uppercase text-white tracking-widest mb-6">
                  Know the Dev
                </h3>
                <div className="border-l-2 border-white/20 pl-6 mb-8">
                  <p className="font-mono text-sm text-white/60 leading-relaxed mb-4">
                    "Hola Amigo! I'm the creator of The Boring Project — and a big
                    fan of One Piece, by the way. I built this platform for
                    developers who want to express their creativity and share their
                    hard work with the world."
                  </p>
                  <p className="font-mono text-sm text-white/60 leading-relaxed mb-4">
                    "Every part of the UI was personally designed by me, with the 
                    help of AI for development and enhancement. Those background 
                    visuals are my own original designs too."
                  </p>
                  <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
                    — Eshan Shettennavar
                  </p>
                </div>
                <a
                  href="https://portfolio-eshan-2z6t.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <button className="bg-white hover:bg-white/90 text-black px-8 py-4 font-mono text-sm uppercase tracking-[0.2em] transition-all">
                    Connect
                  </button>
                </a>
              </motion.div>
            </div>
          </div>
          <ProjectPreviewGrid />
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black py-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Top row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
              {/* Brand */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
                  <Image src="/brand-logo.png" alt="Logo" width={24} height={24} className="grayscale" />
                </div>
                <div>
                  <p className="font-boldonse text-sm uppercase tracking-widest text-white">
                    The Boring Project
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-white/30">
                    Est. 2024
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-wrap gap-6 font-mono text-xs uppercase tracking-widest">
                <button
                  onClick={() => {
                    const aboutSection = document.getElementById("about");
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    const featuresSection = document.getElementById("features");
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </button>
                <a
                  href="https://forms.cloud.microsoft/r/ZYJbUAuLFA?origin=lprLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </div>

              {/* Socials */}
              <div className="flex gap-3">
                <a
                  href="https://github.com/duckhitches"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297a12 12 0 00-3.79 23.412c.6.112.82-.26.82-.578 0-.285-.011-1.04-.017-2.04-3.338.724-4.042-1.61-4.042-1.61a3.184 3.184 0 00-1.335-1.757c-1.09-.745.083-.73.083-.73a2.522 2.522 0 011.84 1.237 2.554 2.554 0 003.488.997 2.558 2.558 0 01.762-1.61c-2.665-.305-5.466-1.333-5.466-5.931A4.64 4.64 0 015.9 7.372a4.302 4.302 0 01.117-3.181s1.006-.322 3.3 1.23a11.37 11.37 0 016.003 0c2.29-1.552 3.296-1.23 3.296-1.23a4.3 4.3 0 01.117 3.18 4.64 4.64 0 011.236 3.213c0 4.61-2.805 5.624-5.476 5.922a2.868 2.868 0 01.815 2.223c0 1.606-.014 2.902-.014 3.296 0 .322.217.698.825.579A12 12 0 0012 .297z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/eshan-shettennavar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75S5.534 4.232 6.5 4.232 8.25 5.016 8.25 5.982s-.784 1.75-1.75 1.75zM20 19h-3v-5.5c0-1.379-.028-3.151-1.92-3.151-1.922 0-2.217 1.501-2.217 3.049V19h-3v-10h2.879v1.367h.041c.402-.761 1.386-1.562 2.854-1.562 3.053 0 3.615 2.01 3.615 4.627V19z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10 mb-6" />

            {/* Bottom row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                © {new Date().getFullYear()} The Boring Project. All rights reserved.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/20">
                Crafted with precision for developers
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <AppShell
      currentView={currentView}
      onNavigate={setCurrentView}
      onNewProject={() => setIsModalOpen(true)}
      onSignOut={signOut}
      title="The Boring Project"
    >
      {renderView()}

      {/* Modals */}
      {isModalOpen && user && (
        <CreateCardModal
          projectToEdit={projectToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setProjectToEdit(null);
          }}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
        />
      )}
      {projectToDelete && (
        <ConfirmDeleteModal
          projectName={projectToDelete.projectName}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            console.log("Closing auth modal");
            setIsAuthModalOpen(false);
          }}
          onAuthSuccess={() => {
            console.log("Auth successful, closing modal");
            setIsAuthModalOpen(false);
          }}
        />
      )}
      {user && <VoiceCompanion />}
    </AppShell>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;

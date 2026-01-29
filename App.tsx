"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "./components/Header";
import { MobileSidebar } from "./components/MobileSidebar";
import { DesktopSidebar } from "./components/DesktopSidebar";
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
import { ArrowRight, Axe, Code, Rocket, Sparkles } from "lucide-react";
import Loading from "./components/ui/loader";
import { supabaseService } from "./services/supabaseService";
import { motion } from "framer-motion";
import { WorldMapDemo } from "./components/ui/WorldMap";
import ProjectPreviewGrid from "./components/ProjectPreviewGrid";
import FeatureShowcase from "./components/FeatureShowcase";

export type View = "dashboard" | "notes" | "settings" | "profile";

const AppContent: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(id) => {
                    const proj = projects.find((p) => p.id === id);
                    if (proj) {
                      setProjectToEdit(proj);
                      setIsModalOpen(true);
                    }
                  }}
                  onDelete={(id) => {
                    const proj = projects.find((p) => p.id === id);
                    if (proj) setProjectToDelete(proj);
                  }}
                />
              ))}
              <div
                onClick={() => setIsModalOpen(true)}
                className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-800 transition"
              >
                <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center mb-3">
                  <PlusIcon className="w-6 h-6 text-neutral-300" />
                </div>
                <p className="text-neutral-400 text-sm">Create New Project</p>
              </div>
            </div>
            {searchQuery && filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-12 text-center">
                <p className="text-neutral-400">
                  No results for “{searchQuery}”
                </p>
              </div>
            )}
          </div>
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
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  // Show landing page for unauthenticated users only when NOT loading
  if (!user && !authLoading && showLandingPage) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center text-center px-4 md:px-6 pt-16 md:pt-24 pb-20 md:pb-32">
          {/* Subtle glow effect */}
          <div className="absolute -top-20 md:-top-40 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/20 blur-3xl rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-4xl"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6 md:mb-8">
              
                <Image
                  src="/images/brand-logo.png"
                  alt="The Boring Project Logo"
                  width={90}
                  height={90}
                  className="rounded-full shadow-lg w-auto h-auto"
                  priority
                  quality={100}
                />
                {/* <Axe className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 text-indigo-400" /> */}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-6xl font-bold mb-4 pb-4 bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              The Boring Project
            </h1>
            <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 px-4">
              The least boring place for devs.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
              <button
                onClick={handleGetStarted}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-transform text-sm md:text-base"
              >
                Get Started{" "}
                <ArrowRight className="inline w-4 h-4 md:w-5 md:h-5 ml-2" />
              </button>
              <button
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="border border-slate-600 hover:bg-slate-800 text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-all text-sm md:text-base"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-20 left-4 md:left-10"
          >
            <Image
              src="/brand-love.png"
              alt="Floating Illustration"
              width={120}
              height={120}
              className="opacity-50 md:opacity-70 md:w-[180px] md:h-[180px]"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            className="absolute bottom-10 right-4 md:right-10"
          >
            <Image
              src="/brand.png"
              alt="Floating Illustration"
              width={120}
              height={120}
              className="opacity-50 md:opacity-70 md:w-[180px] md:h-[180px]"
            />
          </motion.div>
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
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <WorldMapDemo />
        </section>

        {/* DEV SECTION */}
        <section id="about" className="max-w-6xl mx-auto px-6 pb-24">
          <div className="bg-black p-10 md:p-16 rounded-2xl border border-slate-800 grid md:grid-cols-2 items-center gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative h-72 rounded-xl overflow-hidden"
            >
              <Image
                src="/luffy-ace.jpg"
                alt="Developer"
                fill
                className="object-cover"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              
            >
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">
                Know the Dev
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "Hola Amigo! I’m the creator of The Boring Project — and a big
                fan of One Piece, by the way. I built this platform for
                developers who want to express their creativity and share their
                hard work with the world. Every part of the UI was personally
                designed by me, with the help of AI for development and
                enhancement. And yes, those background visuals are my own
                original designs too. Kindly check your News letter for
                upcoming/latest updates." - <i>Eshan Shettennavar</i>
              </p>
              <a
                href="https://portfolio-eshan-2z6t.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105">
                  Connect with Me
                </button>
              </a>
            </motion.div>
          </div>
          <ProjectPreviewGrid />
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm py-10 mt-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
            {/* Left Section */}
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()}{" "}
              <span className="text-white font-semibold">
                The Boring Project
              </span>
              . Crafted with <span className="text-indigo-400">💜</span> for
              developers.
            </p>

            {/* Middle Section - Links */}
            <div className="flex gap-6 text-sm text-gray-400">
              <a
                onClick={() => {
                  const aboutSection = document.getElementById("about");
                  if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="hover:text-white transition-colors duration-200"
              >
                About
              </a>
              <a
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="hover:text-white transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="https://forms.cloud.microsoft/r/ZYJbUAuLFA?origin=lprLink"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                Contact
              </a>
            </div>

            {/* Right Section - Socials */}
            <div className="flex gap-4">
              <a
                href="https://github.com/duckhitches"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .297a12 12 0 00-3.79 23.412c.6.112.82-.26.82-.578 0-.285-.011-1.04-.017-2.04-3.338.724-4.042-1.61-4.042-1.61a3.184 3.184 0 00-1.335-1.757c-1.09-.745.083-.73.083-.73a2.522 2.522 0 011.84 1.237 2.554 2.554 0 003.488.997 2.558 2.558 0 01.762-1.61c-2.665-.305-5.466-1.333-5.466-5.931A4.64 4.64 0 015.9 7.372a4.302 4.302 0 01.117-3.181s1.006-.322 3.3 1.23a11.37 11.37 0 016.003 0c2.29-1.552 3.296-1.23 3.296-1.23a4.3 4.3 0 01.117 3.18 4.64 4.64 0 011.236 3.213c0 4.61-2.805 5.624-5.476 5.922a2.868 2.868 0 01.815 2.223c0 1.606-.014 2.902-.014 3.296 0 .322.217.698.825.579A12 12 0 0012 .297z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/eshan-shettennavar/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75S5.534 4.232 6.5 4.232 8.25 5.016 8.25 5.982s-.784 1.75-1.75 1.75zM20 19h-3v-5.5c0-1.379-.028-3.151-1.92-3.151-1.922 0-2.217 1.501-2.217 3.049V19h-3v-10h2.879v1.367h.041c.402-.761 1.386-1.562 2.854-1.562 3.053 0 3.615 2.01 3.615 4.627V19z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-100 font-zalando">
      {/* Desktop Sidebar */}
      {user && (
        <DesktopSidebar
          activeView={currentView}
          onNavigate={setCurrentView}
          onSignOut={signOut}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {user && (
          <Header
            onNewProjectClick={() => setIsModalOpen(true)}
            onSignOut={signOut}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-neutral-900">
          {user && searchQuery.trim() && (
            <div className="px-4 sm:px-6 py-3 border-b border-neutral-800 bg-neutral-900/80 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm text-neutral-400 mb-2">
                    Projects ({filteredProjects.length})
                  </h4>
                  <ul className="space-y-1">
                    {filteredProjects.slice(0, 5).map((p) => (
                      <li
                        key={p.id}
                        className="text-sm text-neutral-200 truncate"
                      >
                        {p.projectName}
                      </li>
                    ))}
                    {filteredProjects.length === 0 && (
                      <li className="text-sm text-neutral-500">No matches</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-neutral-400 mb-2">
                    Notes ({filteredNotes.length})
                  </h4>
                  <ul className="space-y-1">
                    {filteredNotes.slice(0, 5).map((n) => (
                      <li
                        key={n.id}
                        className="text-sm text-neutral-200 truncate"
                      >
                        {n.title || n.content.substring(0, 48)}
                      </li>
                    ))}
                    {filteredNotes.length === 0 && (
                      <li className="text-sm text-neutral-500">No matches</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {renderView()}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {user && (
        <MobileSidebar
          activeView={currentView}
          onNavigate={setCurrentView}
          onSignOut={signOut}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}

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
    </div>
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

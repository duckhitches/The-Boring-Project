/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "../types";
import { supabaseService } from "../services/supabaseService";
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  SearchIcon,
  ChevronLeftIcon,
} from "./IconComponents";
import { LoaderOne } from "./ui/loader";

const AUTO_SAVE_MS = 10000

const NotesView: React.FC<{ searchQuery?: string }> = ({
  searchQuery = "",
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved"
  );
  const [currentContent, setCurrentContent] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number | null>(
    null
  );
  const [mobileView, setMobileView] = useState<"list" | "editor">("list");

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const lastSavedTitleRef = useRef<string>("");
  const currentContentRef = useRef<string>("")
  const currentTitleRef = useRef<string>("")

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (selectedNote) {
      setCurrentContent(selectedNote.content)
      setCurrentTitle(selectedNote.title)
      lastSavedContentRef.current = selectedNote.content
      lastSavedTitleRef.current = selectedNote.title
      currentContentRef.current = selectedNote.content
      currentTitleRef.current = selectedNote.title
    }
  }, [selectedNote])

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const supabaseNotes = await supabaseService.getNotes();
      setNotes(supabaseNotes);

      if (supabaseNotes.length > 0 && !selectedNote) {
        setSelectedNote(supabaseNotes[0]);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewNote = async () => {
    try {
      const newNote = await supabaseService.createNote({
        title: "Untitled Note",
        content: "",
      });

      if (newNote) {
        setNotes((prev) => [newNote, ...prev]);
        setSelectedNote(newNote);
        setCurrentTitle("Untitled Note");
        setCurrentContent("");
        lastSavedContentRef.current = "";
        lastSavedTitleRef.current = "Untitled Note";
        setMobileView("editor");
      }
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const success = await supabaseService.deleteNote(noteId);
      if (success) {
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        if (selectedNote?.id === noteId) {
          const remainingNotes = notes.filter((note) => note.id !== noteId);
          setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
        }
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const autoSave = useCallback(async () => {
    if (!selectedNote) return

    const latestContent = currentContentRef.current
    const latestTitle = currentTitleRef.current

    const hasChanges = latestContent !== lastSavedContentRef.current || latestTitle !== lastSavedTitleRef.current

    if (!hasChanges) return

    setSaveStatus("saving")

    try {
      const updatedNote = await supabaseService.updateNote(selectedNote.id, {
        title: latestTitle,
        content: latestContent,
      })

      if (updatedNote) {
        setNotes((prev) => prev.map((note) => (note.id === selectedNote.id ? updatedNote : note)))
        lastSavedContentRef.current = latestContent
        lastSavedTitleRef.current = latestTitle
        setSaveStatus("saved")
      } else {
        setSaveStatus("error")
      }
    } catch (error) {
      console.error("Error auto-saving note:", error)
      setSaveStatus("error")
    }
  }, [selectedNote])

  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setAutoSaveCountdown(AUTO_SAVE_MS / 1000);

    countdownIntervalRef.current = setInterval(() => {
      setAutoSaveCountdown((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
      setAutoSaveCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, AUTO_SAVE_MS);
  }, [autoSave]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setCurrentTitle(newTitle)
    currentTitleRef.current = newTitle
    debouncedAutoSave()
  }

  const handleContentChange = (newContent: string) => {
    setCurrentContent(newContent)
    currentContentRef.current = newContent
    debouncedAutoSave()
  }

  const handleSaveNow = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setAutoSaveCountdown(null);
    autoSave();
  };

  const getStats = () => {
    const words = currentContent
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const chars = currentContent.length;
    return { words, chars };
  };

  const stats = getStats();

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  // Update selected note if current selection is filtered out
  useEffect(() => {
    if (
      searchQuery.trim() &&
      selectedNote &&
      !filteredNotes.find((note) => note.id === selectedNote.id)
    ) {
      if (filteredNotes.length > 0) {
        setSelectedNote(filteredNotes[0]);
      } else {
        setSelectedNote(null);
      }
    }
  }, [searchQuery, filteredNotes, selectedNote]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4 text-white/50">
           <LoaderOne />
           <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)] bg-black gap-0 border border-white/10 overflow-hidden">
      {/* Notes Sidebar */}
      <div
        className={`${
          mobileView === "list" ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-80 bg-[#0d0d0d] border-r border-white/10 h-full`}
      >
        <div className="p-4 border-b border-white/10">
          <button
            onClick={createNewNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-white/90 text-black font-boldonse uppercase tracking-widest transition-all duration-200 text-sm group"
          >
            <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            New Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notes.length === 0 ? (
            <div className="p-8 text-center text-white/30 flex flex-col items-center justify-center h-full">
              <DocumentTextIcon className="w-12 h-12 mb-4 opacity-30" />
              <p className="font-mono text-sm uppercase tracking-wider mb-2">No notes yet</p>
              <p className="font-mono text-[10px] opacity-60">Create your first note to get started.</p>
            </div>
          ) : filteredNotes.length === 0 && searchQuery.trim() ? (
            <div className="p-8 text-center text-white/30 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 mb-4 opacity-30">
                <SearchIcon className="w-full h-full" />
              </div>
              <p className="font-mono text-sm uppercase tracking-wider mb-2">No results</p>
              <p className="font-mono text-[10px] opacity-60">No notes match "{searchQuery}"</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => {
                    setSelectedNote(note);
                    setMobileView("editor");
                  }}
                  className={`p-4 cursor-pointer transition-all duration-200 group relative ${
                    selectedNote?.id === note.id
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  {selectedNote?.id === note.id && (
                      <motion.div 
                        layoutId="active-note-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"
                      />
                  )}
                  <h3 className={`font-boldonse uppercase text-sm truncate mb-1 ${
                      selectedNote?.id === note.id ? "text-white" : "text-white/70 group-hover:text-white"
                  }`}>{note.title || "Untitled Note"}</h3>
                  
                  <p className="font-mono text-[10px] text-white/40 truncate">
                    {note.content.substring(0, 40) || "No content..."}
                    {note.content.length > 40 ? "..." : ""}
                  </p>
                  <p className="font-mono text-[10px] text-white/20 mt-2 uppercase tracking-widest">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div
        className={`${
          mobileView === "editor" ? "flex" : "hidden"
        } md:flex flex-1 flex-col bg-[#050505] relative`}
      >
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="p-6 border-b border-white/10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between bg-black/50 backdrop-blur-sm z-10">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-2xl md:text-4xl font-boldonse text-white bg-transparent border-none outline-none placeholder-white/20 w-full uppercase tracking-tight"
                  placeholder="UNTITLED NOTE"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {saveStatus === "saving" && (
                  <div className="flex items-center text-[10px] gap-2 px-3 py-1.5 border border-white/10 text-white/50 font-mono uppercase tracking-widest">
                    <LoaderOne className="w-3 h-3" />
                    <span>Saving...</span>
                  </div>
                )}
                {saveStatus === "saved" && (
                  <div className="flex items-center text-[10px] gap-2 px-3 py-1.5 border border-white/10 text-green-400 font-mono uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Synced</span>
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="flex items-center text-[10px] gap-2 px-3 py-1.5 border border-red-500/20 text-red-400 font-mono uppercase tracking-widest">
                    <span>Error</span>
                  </div>
                )}
                
                <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>

                <button
                  onClick={handleSaveNow}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono uppercase tracking-widest transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="px-3 py-1.5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 text-white/50 transition-colors"
                  title="Delete Note"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="px-6 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest bg-[#080808]">
              <div className="flex gap-6">
                <span>{stats.words} words</span>
                <span>{stats.chars} chars</span>
                {autoSaveCountdown !== null && saveStatus !== "saving" && (
                    <span className="text-white/50">Autosave: {autoSaveCountdown}s</span>
                )}
              </div>
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden flex items-center gap-1 hover:text-white transition-colors"
              >
                <ChevronLeftIcon className="w-3 h-3" /> Back
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              {/* Markdown Editor */}
              <div className="w-full md:w-1/2 flex flex-col border-r border-white/10 h-full">
                <div className="px-4 py-2 border-b border-white/5 bg-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest">Markdown Input</div>
                <textarea
                  value={currentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="flex-1 w-full bg-[#050505] text-white/80 placeholder-white/20 resize-none p-6 outline-none focus:bg-black transition-colors font-mono text-sm leading-relaxed custom-scrollbar selection:bg-indigo-500/30"
                  placeholder="Start typing your note here..."
                />
              </div>

              {/* Live Preview */}
              <div className="hidden md:flex flex-col w-full md:w-1/2 h-full bg-[#0a0a0a]">
                 <div className="px-4 py-2 border-b border-white/5 bg-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest flex justify-between items-center">
                    <span>Preview</span>
                    <span className="text-[9px] px-1.5 py-0.5 border border-white/10 rounded-sm">READ ONLY</span>
                 </div>
                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <article className="prose prose-invert prose-sm max-w-none prose-headings:font-boldonse prose-headings:uppercase prose-p:font-mono prose-p:text-white/70 prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-pre:bg-black prose-pre:border prose-pre:border-white/10">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                        {currentContent || "*Nothing to preview...*"}
                        </ReactMarkdown>
                    </article>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
            <div className="w-24 h-24 mb-6 relative">
                 <div className="absolute inset-0 border border-current opacity-20 rotate-3"></div>
                 <div className="absolute inset-0 border border-current opacity-20 -rotate-3"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <DocumentTextIcon className="w-10 h-10 opacity-50" />
                 </div>
            </div>
            <h2 className="text-xl font-boldonse uppercase mb-2 text-white/40">
              No Selection
            </h2>
            <p className="font-mono text-xs max-w-xs text-center leading-relaxed">
              Select a note from the sidebar to view or edit, or create a new one.
            </p>
            <button
                onClick={() => setMobileView("list")}
                className="md:hidden mt-8 px-6 py-3 border border-white/10 text-white/60 font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors"
                >
                Go to List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;

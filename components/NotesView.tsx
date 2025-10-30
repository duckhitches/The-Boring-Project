"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import type { Note } from "../types";
import { supabaseService } from "../services/supabaseService";
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  SearchIcon,
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
        <div className="text-center">
          <LoaderOne />
          <p className="mt-4 text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)] bg-background gap-3 p-3">
      {/* Notes Sidebar */}
      <div
        className={`${
          mobileView === "list" ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-80 bg-card rounded-lg border border-border shadow-sm overflow-hidden`}
      >
        <div className="p-4 border-b border-border">
          <button
            onClick={createNewNote}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors duration-200 font-medium text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-sm">No notes yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first note!
              </p>
            </div>
          ) : filteredNotes.length === 0 && searchQuery.trim() ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-3 rounded-md bg-muted flex items-center justify-center">
                <SearchIcon className="w-6 h-6" />
              </div>
              <p className="font-medium text-sm">No notes found</p>
              <p className="text-xs text-muted-foreground mt-1">
                No notes match "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setMobileView("editor");
                  }}
                  className={`p-3 rounded-md cursor-pointer transition-colors duration-200 ${
                    selectedNote?.id === note.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <h3 className="font-medium text-sm truncate">{note.title}</h3>
                  <p className="text-xs opacity-75 truncate mt-1">
                    {note.content.substring(0, 40)}
                    {note.content.length > 40 ? "..." : ""}
                  </p>
                  <p className="text-xs opacity-60 mt-2">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor */}
      <div
        className={`${
          mobileView === "editor" ? "flex" : "hidden"
        } md:flex flex-1 flex-col bg-card rounded-lg border border-border shadow-sm overflow-hidden`}
      >
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-xl md:text-2xl font-bold bg-transparent border-none outline-none text-foreground placeholder-muted-foreground w-full"
                  placeholder="Note title..."
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {saveStatus === "saving" && (
                  <div className="flex items-center text-xs gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                    <span>Saving...</span>
                  </div>
                )}
                {saveStatus === "saved" && (
                  <div className="flex items-center text-xs gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Saved</span>
                  </div>
                )}
                {saveStatus === "error" && (
                  <div className="flex items-center text-xs gap-1 px-2 py-1 rounded bg-destructive/10 text-destructive">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Error</span>
                  </div>
                )}
                {autoSaveCountdown !== null && saveStatus !== "saving" && (
                  <div className="flex items-center text-xs gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8v5l3 3"/>
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" fill="none" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Autosave in {autoSaveCountdown}s</span>
                  </div>
                )}
                <button
                  onClick={handleSaveNow}
                  className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs transition-colors duration-200 font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md text-xs transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="px-4 py-2 border-b border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
              <div className="flex gap-4">
                <span>{stats.words} words</span>
                <span>{stats.chars} characters</span>
              </div>
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden px-2 py-1 hover:bg-muted rounded transition-colors"
              >
                ← Back
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Markdown Editor */}
              <div className="w-full md:w-1/2 p-4 border-r border-border md:border-r md:border-border">
                <textarea
                  value={currentContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-full bg-background text-foreground placeholder-muted-foreground resize-none rounded-md p-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm leading-relaxed border border-border"
                  placeholder="Start writing your note... Supports Markdown, code blocks, and lists.  
Example (code):  
```js
console.log('hello');

Example (list):
	•	Item one
	•	Item two.
  
Live preview works best on desktop."
                />
              </div>

              {/* Live Preview */}
              <div className="hidden md:flex w-full md:w-1/2 p-4 bg-muted/30 overflow-y-auto prose prose-sm dark:prose-invert max-w-none rounded-md border-l border-border">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {currentContent || "*Your preview will appear here...*"}
                </ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <DocumentTextIcon className="w-8 h-8 opacity-50" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-foreground">
                No note selected
              </h2>
              <p className="text-sm">
                Choose a note from the sidebar or create a new one
              </p>
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden px-2 py-1 hover:bg-muted rounded transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;

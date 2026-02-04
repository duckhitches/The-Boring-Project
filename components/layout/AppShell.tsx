/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the MIT License.
 * See LICENSE for full license terms.
 */

"use client";

import React from "react";
import StaggeredMenu from "../StaggeredMenu";
import { PlusIcon } from "../IconComponents";

type View = "dashboard" | "notes" | "settings" | "profile";

interface AppShellProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  onNewProject: () => void;
  onSignOut: () => void;
  title?: string;
}

export default function AppShell({
  children,
  currentView,
  onNavigate,
  onNewProject,
  onSignOut,
  title = "The Boring Project",
}: AppShellProps) {
  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-100 font-mono">
      <StaggeredMenu
        isFixed
        position="right"
        displaySocials
        displayItemNumbering
        accentColor="#6366f1"
        title={title}
        // rightSlot={
        //   <button
        //     onClick={onNewProject}
        //     className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white font-medium shadow-[0_8px_30px_-18px_rgba(99,102,241,0.9)]"
        //     type="button"
        //   >
        //     <PlusIcon className="w-5 h-5" />
        //     <span className="hidden sm:inline">New Project</span>
        //   </button>
        // }
        
        items={[
          {
            label: "Dashboard",
            ariaLabel: "Go to Dashboard",
            onClick: () => onNavigate("dashboard"),
          },
          { label: "My Notes", ariaLabel: "Go to Notes", onClick: () => onNavigate("notes") },
          { label: "Settings", ariaLabel: "Go to Settings", onClick: () => onNavigate("settings") },
          { label: "Profile", ariaLabel: "Go to Profile", onClick: () => onNavigate("profile") },
          { label: "Sign out", ariaLabel: "Sign out", onClick: () => onSignOut() },
        ]}
        socialItems={[
          { label: "GitHub", link: "https://github.com/duckhitches" },
          { label: "LinkedIn", link: "https://www.linkedin.com/in/eshan-shettennavar/" },
        ]}
        onMenuOpen={() => {}}
        onMenuClose={() => {}}
      />

      {/* Content. Padding-top to clear the fixed menu header. */}
      <div className="flex-1 flex flex-col overflow-hidden pt-24">
        {/* Optional: you can show current view label here later */}
        <main className="flex-1 overflow-y-auto bg-neutral-900">{children}</main>
      </div>
    </div>
  );
}


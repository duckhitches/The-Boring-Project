"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  SettingsIcon,
  DocumentTextIcon,
  UserIcon,
} from "./IconComponents";
import type { View } from "../App";
import { useAuth } from "./AuthProvider";

interface MobileSidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  activeView,
  onNavigate,
  onSignOut,
  isOpen,
  onToggle,
}) => {
  const { profile, user } = useAuth();
  
  // Helper function to get display name
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (profile?.first_name) return profile.first_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.first_name) return user.user_metadata.first_name;
    return 'User';
  };

  const getDisplayEmail = () => {
    return profile?.email || user?.email || 'user@example.com';
  };
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: HomeIcon, view: "dashboard" as View },
    { id: "notes", label: "My Notes", icon: DocumentTextIcon, view: "notes" as View },
    { id: "settings", label: "Settings", icon: SettingsIcon, view: "settings" as View },
    { id: "profile", label: "Profile", icon: UserIcon, view: "profile" as View },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={onToggle}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed left-0 top-0 h-full w-72 bg-neutral-900/90 backdrop-blur-md border-r border-neutral-800 z-50 md:hidden flex flex-col zalando-sans-semiexpanded-normal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <Image 
                  src="/images/brand-logo.png" 
                  alt="Brand Logo" 
                  width={80} 
                  height={80}
                  className="w-30 h-30 w-auto h-auto"
                  quality={100}
                  priority
                />
                <h1 className="text-lg font-semibold text-white tracking-wide">
                  The Boring Project
                </h1>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              <ul className="mt-6 space-y-1 px-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.view;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          onNavigate(item.view);
                          onToggle();
                        }}
                        className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Divider */}
              <div className="my-5 border-t border-neutral-800"></div>

              {/* Profile Section */}
              <div className="px-4 pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-700">
                    <Image
                      src="/profile.png"
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {getDisplayName()}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {getDisplayEmail()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile Settings
                  </button> */}

                  <button
                    onClick={onSignOut}
                    className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-red-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>

              {/* News Section */}
              <div className="px-4 pb-4">
                <h3 className="text-sm font-semibold text-neutral-200 mb-3">
                  Updates from Developer-Eshan
                </h3>
                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                  {[
                    {
                      color: "bg-green-500",
                      title: "New Search Functionality",
                      desc: "Global search across projects and notes",
                    },
                    {
                      color: "bg-blue-500",
                      title: "Mobile Sidebar Redesign",
                      desc: "Better UX and animations",
                    },
                    {
                      color: "bg-green-500",
                      title: "Auto-save Notes Feature",
                      desc: "Notes now auto-save every minute with visual countdown indicator.",
                    },
                    {
                      color: "bg-purple-500",
                      title: "Theme Engine Update",
                      desc: "Light, Dark, and Image themes Coming Soon.",
                    },
                    {
                      color: "bg-orange-500",
                      title: "Supabase Integration Complete",
                      desc: "Full authentication and database integration is now working perfectly.",
                    },
                  ].map((news, i) => (
                    <div
                      key={i}
                      className="flex items-start p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 ${news.color} rounded-full mt-2 mr-3`}
                      ></div>
                      <div>
                        <p className="text-xs font-medium text-white">{news.title}</p>
                        <p className="text-[11px] text-neutral-400">{news.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>

              {/* Upgrade Section */}
              <div className="px-4 pb-6">
                <div className="p-4 bg-neutral-800/60 rounded-lg text-center border border-neutral-700">
                  <h3 className="text-sm font-semibold text-white">Upgrade to Pro</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Unlock AI features & unlimited projects.
                  </p>
                  <button className="w-full mt-3 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-medium transition-colors">
                    Upgrade
                  </button>
                </div>
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

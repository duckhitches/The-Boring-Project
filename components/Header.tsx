"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  SearchIcon,
  PlusIcon,
} from "./IconComponents";
import { NewsDropdown } from "./NewsDropdown";

interface HeaderProps {
  onNewProjectClick: () => void;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewProjectClick,
  onSignOut,
  searchQuery,
  onSearchChange,
  onToggleSidebar,
}) => {
  const [isNewsOpen, setIsNewsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 sm:px-6 py-3 bg-neutral-900/70 backdrop-blur-md border-b border-neutral-800 zalando-sans-semiexpanded-medium">
      {/* Left: Sidebar toggle (mobile) */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            className="text-neutral-200"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              d="M3 6h18M3 12h18M3 18h18"
            />
          </svg>
        </button>

        {/* Brand / Logo */}
        {/* <div className="hidden md:flex items-center space-x-2 text-neutral-100 font-semibold text-lg tracking-wide">
          <Image 
            src="/images/brand-logo.png" 
            alt="Brand Logo" 
            width={20} 
            height={20}
            className="w-5 h-5"
          />
          <span>The Boring Project</span>
        </div> */}
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

       {/* Right: Actions */}
       <div className="flex items-center space-x-3">
         <button
           onClick={onNewProjectClick}
           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all"
         >
           <PlusIcon className="w-5 h-5" />
           <span className="hidden sm:inline">New Project</span>
         </button>

         {/* News from developer-eshan */}
         <div className="relative">
           <button 
             onClick={() => setIsNewsOpen(!isNewsOpen)}
             className="hidden sm:flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 transition-colors group"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
             </svg>
             <span className="text-xs font-medium group-hover:text-indigo-400 transition-colors">News</span>
             <span className="w-2 h-2 bg-red-500 rounded-full"></span>
           </button>
           
           <NewsDropdown isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />
         </div>
       </div>
    </header>
  );
};
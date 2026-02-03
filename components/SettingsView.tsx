import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import {
  SettingsIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  EnvelopeIcon,
  CreditCardIcon,
  UserIcon,
} from "./IconComponents";

type Theme = "light" | "dark" | "boring-kitty";

interface SettingsProps {
  onThemeChange?: (theme: Theme) => void;
}

const SettingsView: React.FC<SettingsProps> = ({ onThemeChange }) => {
  const { user, loginTime } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<Theme>("dark");
  const [sessionDuration, setSessionDuration] = useState<string>("00:00:00");

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as Theme;
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      if (savedTheme === "boring-kitty") {
        document.body.style.backgroundImage = "url('/bg-2.png')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundPosition = "center";
      }
    }
  }, []);

  // Update session duration every second based on login time
  useEffect(() => {
    if (!loginTime) {
      setSessionDuration("00:00:00");
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - loginTime.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setSessionDuration(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [loginTime]);

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem("app-theme", theme);
    // Apply or clear global background
    if (theme === "boring-kitty") {
      document.body.style.backgroundImage = "url('/bg-2.png')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.style.backgroundPosition = "center";
    } else {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.backgroundPosition = "";
    }
    onThemeChange?.(theme);
  };

  const handleContactSupport = () => {
    window.open("https://portfolio-eshan-2z6t.vercel.app/", "_blank");
  };

  const handleUpgradePlan = () => {
    alert("Bruh, just enjoy the free plan for now!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-black border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-[#0d0d0d]">
        
        <h1 className="text-3xl font-boldonse uppercase text-white tracking-widest">
          System Settings
        </h1>
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider">
            Manage your boring tweaks here
          </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          
          {/* Usage Statistics */}
          <div className="p-6 border-b md:border-r border-white/10 bg-black hover:bg-white/5 transition-colors group min-h-[200px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                  Session Duration
                </h2>
                <ClockIcon className="w-4 h-4 text-white/30 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p className="text-4xl font-boldonse text-white tracking-tighter">
                {sessionDuration}
              </p>
            </div>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mt-4">
              Active Session
            </p>
          </div>

          {/* Account Status */}
           <div className="p-6 border-b md:border-r border-white/10 bg-black hover:bg-white/5 transition-colors group min-h-[200px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                  Account Status
                </h2>
                <UserIcon className="w-4 h-4 text-white/30 group-hover:text-green-400 transition-colors" />
              </div>
              <p className="text-4xl font-boldonse text-white tracking-tighter uppercase text-green-500">
                Active
              </p>
            </div>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mt-4">
              Member Since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
            </p>
          </div>

          {/* Contact Support */}
          <div className="p-6 border-b border-white/10 bg-black hover:bg-white/5 transition-colors group min-h-[200px] flex flex-col justify-between">
             <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                  Support
                </h2>
                <EnvelopeIcon className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-xl font-boldonse text-white tracking-wide uppercase mb-2">
                Need Help?
              </h3>
              <p className="font-mono text-xs text-white/50 mb-4 max-w-[200px]">
                Reach out to us for any assistance or inquiries.
              </p>
            </div>
            <button
               onClick={handleContactSupport}
               className="self-start px-4 py-2 border border-white/10 hover:bg-white hover:text-black text-white text-[10px] font-mono uppercase tracking-widest transition-all"
            >
               Contact Support
            </button>
          </div>

          {/* Plan Info */}
          <div className="p-6 border-b md:border-r border-white/10 bg-black hover:bg-white/5 transition-colors group min-h-[200px] flex flex-col justify-between">
             <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                   Subscription
                </h2>
                <CreditCardIcon className="w-4 h-4 text-white/30 group-hover:text-purple-400 transition-colors" />
              </div>
               <h3 className="text-2xl font-boldonse text-white tracking-wide uppercase mb-2">
                Free Plan
              </h3>
              <p className="font-mono text-xs text-white/50 mb-4">
                Limited features active.
              </p>
            </div>
            <button
               onClick={handleUpgradePlan}
               className="self-start px-4 py-2 bg-white text-black hover:bg-white/90 text-[10px] font-mono uppercase tracking-widest transition-all"
            >
               Upgrade
            </button>
          </div>

           {/* Account Details */}
           <div className="p-6 border-b md:border-r border-white/10 bg-black hover:bg-white/5 transition-colors group md:col-span-2 min-h-[200px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-xs uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                  System Information
                </h2>
                <SettingsIcon className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="font-mono text-[10px] text-white/30 uppercase block mb-1">Email Identifier</label>
                   <p className="font-mono text-sm text-white">{user?.email || "N/A"}</p>
                </div>
                <div>
                   <label className="font-mono text-[10px] text-white/30 uppercase block mb-1">User UUID</label>
                   <p className="font-mono text-sm text-white/70 break-all">{user?.id || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Theme Section (Hidden/Commented in original, but recreating structure if needed later) */}
         <div className="p-6 border-b border-white/10 bg-[#0a0a0a]">
           <h2 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-6">
              Appearance Settings (Disabled)
           </h2>
           <div className="flex gap-4 opacity-50 pointer-events-none grayscale">
              <div className="w-32 h-20 border border-white/10 bg-white/5 p-2 flex flex-col justify-between">
                 <span className="font-mono text-[10px] text-white/50">LIGHT</span>
              </div>
               <div className="w-32 h-20 border border-white/10 bg-white/10 p-2 flex flex-col justify-between">
                 <span className="font-mono text-[10px] text-white">DARK</span>
              </div>
           </div>
         </div>

      </div>
    </div>
  );
};

export default SettingsView;

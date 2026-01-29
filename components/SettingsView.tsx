import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import {
  SettingsIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  EnvelopeIcon,
  CreditCardIcon,
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

  // Removed scenic image selection feature

  const handleContactSupport = () => {
    window.open("https://portfolio-eshan-2z6t.vercel.app/", "_blank");
  };

  const handleUpgradePlan = () => {
    // In a real app, this would redirect to a payment page
    alert("Bruh, just enjoy the free plan for now!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-indigo-500" />
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      {/* Theme Selection */}
      <div className="bg-black/40 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>
        <p className="text-slate-400 mb-6">
          Choose your preferred theme for the application.
        </p>

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
        {/* Light Theme */}
        {/* <div
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTheme === 'light'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <SunIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="font-medium text-white">Light(Coming Soon)</h3>
            </div>
            <p className="text-sm text-slate-400">Clean and bright interface</p>
            <div className="mt-3 h-16 bg-white rounded border border-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-sm">Light Preview</span>
            </div>
          </div> */}

        {/* Dark Theme */}
        {/* <div
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTheme === 'dark'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <MoonIcon className="w-6 h-6 text-blue-400" />
              <h3 className="font-medium text-white">Dark</h3>
            </div>
            <p className="text-sm text-slate-400">Easy on the eyes</p>
            <div className="mt-3 h-16 bg-slate-800 rounded border border-slate-600 flex items-center justify-center">
              <span className="text-slate-300 text-sm">Dark Preview</span>
            </div>
          </div> */}

        {/* Boring Kitty Theme */}
        {/* <div
            onClick={() => handleThemeChange('boring-kitty')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTheme === 'boring-kitty'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <span className="inline-block w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-yellow-300" />
              <h3 className="font-medium text-white">Boring Kitty(Coming Soon)</h3>
            </div>
            <p className="text-sm text-slate-400">Applies a playful gradient background</p>
            <div className="mt-3 h-16 rounded flex items-center justify-center" style={{ backgroundImage: "url('/bg-2.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <span className="text-white text-sm bg-black/40 px-2 py-0.5 rounded">Preview</span>
            </div>
          </div>
        </div>
      </div> */}

        {/* Usage Statistics */}
        <div className="bg-black/40 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Usage Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Time Spent Today</h3>
                <p className="text-2xl font-bold text-indigo-400">
                  {sessionDuration}
                </p>
                <p className="text-sm text-slate-400">Current session</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Account Status</h3>
                <p className="text-lg font-semibold text-green-400">Active</p>
                <p className="text-sm text-slate-400">
                  Since{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-black/40 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Contact & Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <EnvelopeIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Get Help</h3>
                <p className="text-slate-400 mb-2">
                  Need assistance? We're here to help.
                </p>
                <button
                  onClick={handleContactSupport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Current Plan</h3>
                <p className="text-slate-400 mb-2">
                  Free Plan - Limited features
                </p>
                <button
                  onClick={handleUpgradePlan}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-black/40 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Email</span>
              <span className="text-white">{user?.email || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">User ID</span>
              <span className="text-white font-mono text-sm">
                {user?.id || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Member Since</span>
              <span className="text-white">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Removed Scenic Image Selection section for Boring Kitty theme */}
      </div>
    </div>
  );
};

export default SettingsView;

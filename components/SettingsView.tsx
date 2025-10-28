import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { SettingsIcon, SunIcon, MoonIcon, PhotoIcon, ClockIcon, EnvelopeIcon, CreditCardIcon } from './IconComponents';

type Theme = 'light' | 'dark' | 'image';

interface SettingsProps {
  onThemeChange?: (theme: Theme) => void;
}

const SettingsView: React.FC<SettingsProps> = ({ onThemeChange }) => {
  const { user, loginTime } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<Theme>('dark');
  const [selectedScenicImage, setSelectedScenicImage] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<string>('00:00:00');

  // Pre-uploaded scenic images - Replace these URLs with your actual image paths
  const scenicImages = [
    {
      id: 'mountain-lake',
      name: 'Mountain Lake',
      url: '/images/scenic/mountain-lake.jpg', // Replace with your image path
      preview: 'https://picsum.photos/400/300?random=1' // Temporary placeholder
    },
    {
      id: 'forest-path',
      name: 'Forest Path',
      url: '/images/scenic/forest-path.jpg', // Replace with your image path
      preview: 'https://picsum.photos/400/300?random=2' // Temporary placeholder
    },
    {
      id: 'ocean-sunset',
      name: 'Ocean Sunset',
      url: '/images/scenic/ocean-sunset.jpg', // Replace with your image path
      preview: 'https://picsum.photos/400/300?random=3' // Temporary placeholder
    },
    {
      id: 'city-skyline',
      name: 'City Skyline',
      url: '/images/scenic/city-skyline.jpg', // Replace with your image path
      preview: 'https://picsum.photos/400/300?random=4' // Temporary placeholder
    }
  ];

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    const savedScenicImage = localStorage.getItem('app-scenic-image');
    
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }
    
    if (savedScenicImage) {
      setSelectedScenicImage(savedScenicImage);
    }
  }, []);

  // Update session duration every second based on login time
  useEffect(() => {
    if (!loginTime) {
      setSessionDuration('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - loginTime.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setSessionDuration(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [loginTime]);

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem('app-theme', theme);
    onThemeChange?.(theme);
  };

  const handleScenicImageSelect = (imageId: string) => {
    setSelectedScenicImage(imageId);
    localStorage.setItem('app-scenic-image', imageId);
    // Also set theme to image if not already
    if (selectedTheme !== 'image') {
      handleThemeChange('image');
    }
  };

  const handleContactSupport = () => {
    window.open('https://github.com/your-repo/support', '_blank');
  };

  const handleUpgradePlan = () => {
    // In a real app, this would redirect to a payment page
    alert('Upgrade functionality would be implemented here!');
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
        <p className="text-slate-400 mb-6">Choose your preferred theme for the application.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Light Theme */}
          <div
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTheme === 'light'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <SunIcon className="w-6 h-6 text-yellow-500" />
              <h3 className="font-medium text-white">Light</h3>
            </div>
            <p className="text-sm text-slate-400">Clean and bright interface</p>
            <div className="mt-3 h-16 bg-white rounded border border-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-sm">Light Preview</span>
            </div>
          </div>

          {/* Dark Theme */}
          <div
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
          </div>

          {/* Image Theme */}
          <div
            onClick={() => handleThemeChange('image')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTheme === 'image'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <PhotoIcon className="w-6 h-6 text-purple-500" />
              <h3 className="font-medium text-white">Scenic</h3>
            </div>
            <p className="text-sm text-slate-400">Beautiful background images</p>
            <div className="mt-3 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
              <span className="text-white text-sm">Scenic Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-black/40 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Time Spent Today</h3>
              <p className="text-2xl font-bold text-indigo-400">{sessionDuration}</p>
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
              <p className="text-sm text-slate-400">Since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="bg-black/40 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Contact & Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <EnvelopeIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Get Help</h3>
              <p className="text-slate-400 mb-2">Need assistance? We're here to help.</p>
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
              <p className="text-slate-400 mb-2">Free Plan - Limited features</p>
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
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-700">
            <span className="text-slate-400">Email</span>
            <span className="text-white">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-700">
            <span className="text-slate-400">User ID</span>
            <span className="text-white font-mono text-sm">{user?.id || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400">Member Since</span>
            <span className="text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Scenic Image Selection */}
      {selectedTheme === 'image' && (
        <div className="bg-black/40 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Choose Scenic Background</h2>
          <p className="text-slate-400 mb-6">Select one of the pre-uploaded scenic images for your background.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenicImages.map((image) => (
              <div
                key={image.id}
                onClick={() => handleScenicImageSelect(image.id)}
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                  selectedScenicImage === image.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-white font-medium mb-1">{image.name}</h3>
                    <p className="text-white/80 text-sm">Click to select</p>
                  </div>
                </div>
                {selectedScenicImage === image.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Image Upload Instructions */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-white font-medium mb-2">📁 To Add Your Own Images:</h3>
            <div className="text-slate-300 text-sm space-y-1">
              <p>1. Create a folder: <code className="bg-slate-600 px-2 py-1 rounded">public/images/scenic/</code></p>
              <p>2. Add your images with these exact names:</p>
              <ul className="ml-4 space-y-1">
                <li>• <code className="bg-slate-600 px-1 rounded">mountain-lake.jpg</code></li>
                <li>• <code className="bg-slate-600 px-1 rounded">forest-path.jpg</code></li>
                <li>• <code className="bg-slate-600 px-1 rounded">ocean-sunset.jpg</code></li>
                <li>• <code className="bg-slate-600 px-1 rounded">city-skyline.jpg</code></li>
              </ul>
              <p>3. Update the <code className="bg-slate-600 px-1 rounded">url</code> property in the <code className="bg-slate-600 px-1 rounded">scenicImages</code> array above</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;

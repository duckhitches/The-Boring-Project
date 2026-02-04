/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/stateful-button";
import { supabaseService } from "../services/supabaseService";
import { useAuth } from "./AuthProvider";
import { TrashIcon, KeyIcon, UserIcon } from "./IconComponents";

interface ProfileSettingsProps {
  onClose?: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'password'>('account');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'Delete') {
      setDeleteError('Please type "Delete" exactly to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      // Delete user account from Supabase
      const { error } = await supabaseService.deleteUser();
      if (error) throw error;
      
      // Show success banner before redirect
      setShowDeleteSuccess(true);
      
      // Sign out and redirect after showing banner
      setTimeout(async () => {
        await signOut();
        window.location.href = '/';
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setDeleteError(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');

    try {
      const { error } = await supabaseService.updatePassword(currentPassword, newPassword);
      if (error) throw error;
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success banner
      setShowPasswordSuccess(true);
      setTimeout(() => setShowPasswordSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent paste
    e.preventDefault();
    setDeleteConfirm(e.target.value);
  };

  const handleDeleteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent paste with Ctrl+V
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-black border border-white/10 overflow-hidden">
      {/* Success Banners */}
      {showPasswordSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/10 border border-green-500 text-green-500 px-6 py-3 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center space-x-3 backdrop-blur-md">
           <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
           <span className="font-mono text-xs uppercase tracking-widest">Password Changed</span>
        </div>
      )}
      
      {showDeleteSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/10 border border-red-500 text-red-500 px-6 py-3 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center space-x-3 backdrop-blur-md">
           <div className="w-2 h-2 bg-red-500 animate-pulse"></div>
           <span className="font-mono text-xs uppercase tracking-widest">Account Deleted. Redirecting...</span>
        </div>
      )}
      
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d0d]">
         <div>
          <h1 className="text-3xl font-boldonse text-white uppercase tracking-widest mb-1">
            Profile & Security
          </h1>
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider">
            Manage your personal data and access credentials
          </p>
         </div>

         {/* Tabs */}
        <div className="flex border border-white/10 bg-black">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-6 py-3 text-[10px] font-mono uppercase tracking-widest transition-all ${
              activeTab === 'account'
                ? 'bg-white text-black'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserIcon className="w-3 h-3" />
            Account
          </button>
          <div className="w-px bg-white/10"></div>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-6 py-3 text-[10px] font-mono uppercase tracking-widest transition-all ${
              activeTab === 'password'
                ? 'bg-white text-black'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyIcon className="w-3 h-3" />
            Password
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-12">
        
          {/* Account Settings */}
          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white/50 mb-8 pb-4 border-b border-white/10">
                   <span className="font-mono text-[10px] uppercase tracking-widest">01 / Personal Info</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-[10px] font-mono uppercase text-white/30 mb-2 group-hover:text-white/70 transition-colors">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                   <div className="group">
                    <label className="block text-[10px] font-mono uppercase text-white/30 mb-2 group-hover:text-white/70 transition-colors">
                      Unique Identifier (UUID)
                    </label>
                    <input
                      type="text"
                      value={user?.id || ''}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/50 font-mono text-xs focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                   <div className="group">
                    <label className="block text-[10px] font-mono uppercase text-white/30 mb-2 group-hover:text-white/70 transition-colors">
                      Registration Date
                    </label>
                    <input
                      type="text"
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-4 text-red-500/50 mb-8 pb-4 border-b border-red-500/20">
                   <span className="font-mono text-[10px] uppercase tracking-widest">02 / Danger Zone</span>
                </div>
                
                <div className="border border-red-500/20 bg-red-500/5 p-8">
                  <h2 className="text-xl font-boldonse text-red-500 uppercase tracking-widest mb-4">
                    Delete Account
                  </h2>
                  <p className="text-white/50 font-mono text-xs mb-8 max-w-md">
                    This action is <span className="text-red-400">irreversible</span>. All your data, projects, and settings will be permanently erased.
                  </p>
                  
                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-red-400/70 mb-2">
                        Type "<span className="text-red-400 font-bold">Delete</span>" to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={handleDeleteInputChange}
                        onKeyDown={handleDeleteKeyDown}
                        onPaste={(e) => e.preventDefault()}
                        placeholder=""
                        className="w-full px-4 py-3 bg-black border border-red-500/30 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition-colors placeholder-white/10"
                      />
                    </div>
                    
                    {deleteError && (
                      <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase tracking-widest">
                        {deleteError}
                      </div>
                    )}
                    
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'Delete' || isDeleting}
                      className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-widest py-4 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                      {isDeleting ? 'Erasing Data...' : 'Permanently Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Password Settings */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
              <div className="border border-white/10 bg-[#0a0a0a] p-8 md:p-12">
                <h2 className="text-2xl font-boldonse text-white uppercase tracking-widest mb-2">
                  Change Password
                </h2>
                <p className="text-white/40 font-mono text-xs mb-10">
                  Update your credentials. Ensure you use a strong password.
                </p>
                
                <div className="space-y-8">
                  <div className="group">
                    <label className="block text-[10px] font-mono uppercase text-white/30 mb-2 group-hover:text-white/70 transition-colors">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-white/10"
                      placeholder="••••••••••••"
                      required
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-[10px] font-mono uppercase text-white/30 mb-2 group-hover:text-white/70 transition-colors">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-white/10"
                      placeholder="••••••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="group">
                    <label className="block text-[10px] font-mono uppercase text-white/30 mb-2 group-hover:text-white/70 transition-colors">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder-white/10"
                      placeholder="••••••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  {passwordError && (
                    <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase tracking-widest">
                       ! {passwordError}
                    </div>
                  )}
                  
                  <button
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                    className="w-full bg-white hover:bg-white/90 text-black text-xs font-mono uppercase tracking-widest py-4 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};


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
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-6">
      {/* Success Banners */}
      {showPasswordSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <span className="font-medium">Password changed successfully!</span>
        </motion.div>
      )}
      
      {showDeleteSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
          <span className="font-medium">Account deleted successfully! Redirecting...</span>
        </motion.div>
      )}
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 zalando-sans-semiexpanded-bold">
            Profile Settings
          </h1>
          <p className="text-neutral-400 zalando-sans-semiexpanded-normal">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === 'account'
                ? 'bg-indigo-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <UserIcon className="w-5 h-5 mr-2" />
            Account
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              activeTab === 'password'
                ? 'bg-indigo-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            <KeyIcon className="w-5 h-5 mr-2" />
            Password
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Account Information */}
              <div className="bg-black/40 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 zalando-sans-semiexpanded-semibold">
                  Account Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-300 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={user?.id || ''}
                      disabled
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-300 cursor-not-allowed text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Member Since
                    </label>
                    <input
                      type="text"
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                      disabled
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-300 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-red-400 mb-4 zalando-sans-semiexpanded-semibold">
                  Danger Zone
                </h2>
                <p className="text-neutral-300 mb-6">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-400 mb-2">
                      Type "Delete" to confirm account deletion
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={handleDeleteInputChange}
                      onKeyDown={handleDeleteKeyDown}
                      onPaste={(e) => e.preventDefault()}
                      placeholder="Type 'Delete' here"
                      className="w-full px-4 py-3 bg-neutral-800 border border-red-500/50 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  {deleteError && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{deleteError}</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== 'Delete' || isDeleting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* <TrashIcon className="w-5 h-5 mr-2" /> */}
                    {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Password Settings */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-black/40 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 zalando-sans-semiexpanded-semibold">
                  Change Password
                </h2>
                <p className="text-neutral-400 mb-6">
                  Update your password to keep your account secure.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your new password"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Confirm your new password"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  {passwordError && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{passwordError}</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    
                    Change Password
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

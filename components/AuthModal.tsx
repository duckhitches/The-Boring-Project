/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

import React, { useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import { Button } from './ui/stateful-button';
import Banner from './ui/Banner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [authErrorType, setAuthErrorType] = useState<'none' | 'auth_failed'>('none');
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setAuthErrorType('none');

    try {
      if (isLogin) {
        const { user, error } = await supabaseService.signIn(email, password);
        console.log('Sign in result:', { user, error });
        if (error) {
          console.log('Error details:', error);
          const msg = (error?.message || '').toLowerCase();
          console.log('Error message:', msg);
          
          // Set generic auth failed error for any authentication error
          setAuthErrorType('auth_failed');
          throw error;
        }
        onAuthSuccess(user);
      } else {
        const { user, error } = await supabaseService.signUp(email, password, {
          firstName,
          lastName
        });
        if (error) throw error;
        
        // Show verification banner for sign up
        setShowVerificationBanner(true);
        
        // Don't close modal immediately, let user see the banner
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error: any) {
      console.log('Caught error:', error);
      setError(error.message);
      throw error; // rethrow so stateful button does not show success
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Banner 
        show={showVerificationBanner}
        message="Please verify your email via an email received from Supabase And Do Not Forget Your Password"
        onClose={() => setShowVerificationBanner(false)}
        autoHide={true}
        duration={5000}
        type="info"
      />
      
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:30px_30px] opacity-10 pointer-events-none" />
        
        {/* Modal Container */}
        <div className="relative bg-black border border-white/20 p-8 md:p-10 w-full max-w-md mx-4 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-white/30" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-white/30" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-white/30" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-white/30" />
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">
                {isLogin ? 'Authentication' : 'Registration'}
              </p>
              <h2 className="text-2xl font-boldonse uppercase tracking-widest text-white">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/40 hover:bg-white hover:text-black transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/20 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                    placeholder="First name"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/20 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                    placeholder="Last name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/20 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-black border border-white/20 text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((v) => !v)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-white/40 hover:text-white transition-colors"
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 3l18 18"/><path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"/><path d="M16.24 16.24A9.77 9.77 0 0 1 12 18c-5 0-9-4.5-9-6a10.44 10.44 0 0 1 4.22-4.73"/><path d="M14.12 9.88A2 2 0 0 0 12 8a2 2 0 0 0-2 2c0 .55.22 1.05.58 1.41"/><path d="M17.94 13.94A10.44 10.44 0 0 0 21 12c0-1.5-4-6-9-6a9.77 9.77 0 0 0-3.95.81"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6-11-6-11-6z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {isLogin && authErrorType === 'auth_failed' && (
              <div className="bg-red-500/10 border border-red-500/50 p-4">
                <p className="text-red-400 font-mono text-xs uppercase tracking-wider">
                  Error: Invalid credentials or account not found
                </p>
              </div>
            )}
            
            {/* Debug info - remove this after testing */}
            {process.env.NODE_ENV === 'development' && authErrorType !== 'none' && (
              <div className="bg-blue-500/10 border border-blue-500/40 p-3">
                <p className="text-blue-400 font-mono text-[10px] uppercase">Debug: Error type = {authErrorType}</p>
                {error && <p className="text-blue-400 font-mono text-[10px]">Error message: {error}</p>}
              </div>
            )}

            <Button
              type="button"
              onClick={handleSubmit}
              className={
                isLogin && authErrorType === 'auth_failed'
                  ? 'w-full bg-red-600 hover:bg-red-700 text-white font-mono text-sm uppercase tracking-widest py-4 px-4 transition-colors'
                  : 'w-full bg-white hover:bg-white/90 text-black font-mono text-sm uppercase tracking-widest py-4 px-4 transition-colors'
              }
            >
              {isLogin && authErrorType === 'auth_failed' ? 'Auth Failed' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Toggle */}
          <div className="text-center">
            <p className="font-mono text-xs text-white/40 mb-2">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setAuthErrorType('none');
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
              }}
              className="font-mono text-sm uppercase tracking-widest text-white hover:text-white/70 transition-colors border-b border-white/30 hover:border-white pb-1"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;

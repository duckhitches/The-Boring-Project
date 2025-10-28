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
        message="Please verify your email via an email received from Supabase."
        onClose={() => setShowVerificationBanner(false)}
        autoHide={true}
        duration={5000}
      />
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-black/60 rounded-2xl p-8 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="First name"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Last name"
                    required={!isLogin}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-300 hover:text-white"
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              >
                {passwordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 3l18 18"/><path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"/><path d="M16.24 16.24A9.77 9.77 0 0 1 12 18c-5 0-9-4.5-9-6a10.44 10.44 0 0 1 4.22-4.73"/><path d="M14.12 9.88A2 2 0 0 0 12 8a2 2 0 0 0-2 2c0 .55.22 1.05.58 1.41"/><path d="M17.94 13.94A10.44 10.44 0 0 0 21 12c0-1.5-4-6-9-6a9.77 9.77 0 0 0-3.95.81"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6-11-6-11-6z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Error banner */}
          {isLogin && authErrorType === 'auth_failed' && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">Wrong password or the Account doesnt exist</p>
            </div>
          )}
          
          {/* Debug info - remove this after testing */}
          {process.env.NODE_ENV === 'development' && authErrorType !== 'none' && (
            <div className="bg-blue-500/10 border border-blue-500/40 rounded-lg p-2">
              <p className="text-blue-400 text-xs">Debug: Error type = {authErrorType}</p>
              {error && <p className="text-blue-400 text-xs">Error message: {error}</p>}
            </div>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            className={
              isLogin && authErrorType === 'auth_failed'
                ? 'w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors'
                : 'w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors'
            }
          >
            {isLogin && authErrorType === 'auth_failed' ? 'sign-in not valid' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFirstName('');
              setLastName('');
              setEmail('');
              setPassword('');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium ml-1"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;

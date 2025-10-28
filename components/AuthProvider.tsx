import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseService } from '../services/supabaseService';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginTime: Date | null;
  signIn: (email: string, password: string) => Promise<{ user: any; error: any }>;
  signUp: (email: string, password: string, profileData?: { firstName: string; lastName: string }) => Promise<{ user: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { firstName: string; lastName: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginTime, setLoginTime] = useState<Date | null>(null);

  const loadUserProfile = async (user: User) => {
    try {
      // Try to get profile from profiles table first
      const profileData = await supabaseService.getUserProfile(user.id);
      console.log('Loading user profile:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to user metadata
      const profileData = {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      console.log('Using fallback profile data:', profileData);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { user: currentUser } = await supabaseService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          await loadUserProfile(currentUser);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Set login time for existing sessions (when page refreshes)
        if (event === 'SIGNED_IN' && !loginTime) {
          setLoginTime(new Date());
        }
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoginTime(null); // Clear login time when user signs out
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await supabaseService.signIn(email, password);
    if (result.user) {
      setUser(result.user);
      setLoginTime(new Date()); // Set login time when user signs in
      await loadUserProfile(result.user);
    }
    return result;
  };

  const signUp = async (email: string, password: string, profileData?: { firstName: string; lastName: string }) => {
    const result = await supabaseService.signUp(email, password, profileData);
    if (result.user) {
      setUser(result.user);
      setLoginTime(new Date()); // Set login time when user signs up
      // Load profile immediately after signup
      await loadUserProfile(result.user);
    }
    return result;
  };

  const signOut = async () => {
    await supabaseService.signOut();
    setUser(null);
    setProfile(null);
    setLoginTime(null); // Clear login time when user signs out
  };

  const updateProfile = async (updates: { firstName: string; lastName: string }) => {
    if (!user) throw new Error('No user logged in');
    
    const result = await supabaseService.updateUserProfile(user.id, updates);
    if (result.user) {
      setUser(result.user);
      await loadUserProfile(result.user);
    }
  };

  const value = {
    user,
    profile,
    loading,
    loginTime,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Copyright (c) 2025 Eshan Vijay Shettennavar
 * 
 * This file is licensed under the Business Source License 1.1.
 * See LICENSE-PROPRIETARY.md for full license terms.
 * 
 * Commercial use of this codebase as a SaaS product without explicit permission is prohibited.
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import type { Project, Note, SignUpData } from '../types';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn(
    "Supabase is not configured. Data will be stored locally only."
  );
}

// Authentication methods
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, profileData?: SignUpData) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileData ? {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          full_name: `${profileData.firstName} ${profileData.lastName}`.trim()
        } : undefined
      }
    });
    
    return { user: data.user, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { user: data.user, error };
  },

  // Sign out
  async signOut() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Listen for auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password (used to check if account exists)
  async resetPassword(email: string) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },
};

const BUCKET_NAME = 'project-backgrounds';

// Main service with auth methods
export const supabaseService = {
  // Auth methods
  ...authService,

  // Project CRUD Operations
  // Get all projects for the current user
  async getProjects(): Promise<Project[]> {
    if (!supabase) return [];
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Get current user's profile information
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      console.log('🔍 DEBUG - Dashboard projects fetch:');
      console.log('Current user_id:', user.id);
      console.log('Profile data:', profileData);

      const userInfo = profileData ? {
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email
      } : {
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        email: user.email
      };

      console.log('Final userInfo for dashboard:', userInfo);
      
      // Map database columns to TypeScript interface
      return (data || []).map((row: any) => ({
        id: row.id,
        projectName: row.project_name,
        timeline: row.timeline,
        description: row.description,
        codeSnippet: row.code_snippet,
        codeLanguage: row.code_language,
        screenshots: row.screenshots || [],
        githubLink: row.github_link,
        liveLink: row.live_link,
        contactEmail: row.contact_email,
        backgroundImage: row.background_image,
        tags: row.tags || [],
        startDate: row.start_date,
        endDate: row.end_date,
        userInfo: userInfo,
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  // Get a single project by ID (public access for sharing)
  async getProjectById(projectId: string): Promise<Project | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      if (!data) return null;

      // Get user information for the project creator
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', data.user_id)
        .single();

      const userInfo = profileData && !profileError ? {
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email
      } : {
        firstName: 'Anonymous',
        lastName: 'User',
        email: `user-${data.user_id.slice(0, 8)}@example.com`
      };
      
      // Map database columns to TypeScript interface
      return {
        id: data.id,
        projectName: data.project_name,
        timeline: data.timeline,
        description: data.description,
        codeSnippet: data.code_snippet,
        codeLanguage: data.code_language,
        screenshots: data.screenshots || [],
        githubLink: data.github_link,
        liveLink: data.live_link,
        contactEmail: data.contact_email,
        backgroundImage: data.background_image,
        tags: data.tags || [],
        startDate: data.start_date,
        endDate: data.end_date,
        userInfo: userInfo,
      };
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }
  },

  // Create a new project
  async createProject(project: Omit<Project, 'id'>): Promise<Project | null> {
    if (!supabase) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Map TypeScript interface to database columns
      const dbProject = {
        project_name: project.projectName,
        timeline: project.timeline,
        description: project.description,
        code_snippet: project.codeSnippet,
        code_language: project.codeLanguage,
        screenshots: project.screenshots || [],
        github_link: project.githubLink,
        live_link: project.liveLink,
        contact_email: project.contactEmail,
        background_image: project.backgroundImage,
        tags: project.tags || [],
        start_date: project.startDate,
        end_date: project.endDate,
        user_id: user.id, // Use authenticated user ID
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([dbProject])
        .select()
        .single();
      
      if (error) throw error;
      
      // Map database response back to TypeScript interface
      return {
        id: data.id,
        projectName: data.project_name,
        timeline: data.timeline,
        description: data.description,
        codeSnippet: data.code_snippet,
        codeLanguage: data.code_language,
        screenshots: data.screenshots || [],
        githubLink: data.github_link,
        liveLink: data.live_link,
        contactEmail: data.contact_email,
        backgroundImage: data.background_image,
        tags: data.tags || [],
        startDate: data.start_date,
        endDate: data.end_date,
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  },

  // Update an existing project
  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    if (!supabase) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Map TypeScript interface to database columns
      const dbUpdates: any = {};
      if (updates.projectName !== undefined) dbUpdates.project_name = updates.projectName;
      if (updates.timeline !== undefined) dbUpdates.timeline = updates.timeline;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.codeSnippet !== undefined) dbUpdates.code_snippet = updates.codeSnippet;
      if (updates.codeLanguage !== undefined) dbUpdates.code_language = updates.codeLanguage;
      if (updates.screenshots !== undefined) dbUpdates.screenshots = updates.screenshots;
      if (updates.githubLink !== undefined) dbUpdates.github_link = updates.githubLink;
      if (updates.liveLink !== undefined) dbUpdates.live_link = updates.liveLink;
      if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail;
      if (updates.backgroundImage !== undefined) dbUpdates.background_image = updates.backgroundImage;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;

      const { data, error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own projects
        .select()
        .single();
      
      if (error) throw error;
      
      // Map database response back to TypeScript interface
      return {
        id: data.id,
        projectName: data.project_name,
        timeline: data.timeline,
        description: data.description,
        codeSnippet: data.code_snippet,
        codeLanguage: data.code_language,
        screenshots: data.screenshots || [],
        githubLink: data.github_link,
        liveLink: data.live_link,
        contactEmail: data.contact_email,
        backgroundImage: data.background_image,
        tags: data.tags || [],
        startDate: data.start_date,
        endDate: data.end_date,
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },

  // Delete a project
  async deleteProject(id: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own projects
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  },

  // Notes CRUD Operations
  // Get all notes for the current user
  async getNotes(): Promise<Note[]> {
    if (!supabase) return [];
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_id: row.user_id,
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  },

  // Create a new note
  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Note | null> {
    if (!supabase) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: note.title,
          content: note.content,
          user_id: user.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
      };
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  },

  // Update an existing note
  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Note | null> {
    if (!supabase) return null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own notes
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
      };
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },

  // Delete a note
  async deleteNote(id: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own notes
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },

  // Upload image to storage
  async uploadImage(file: File): Promise<string | null> {
    if (!supabase) {
      // Fallback to local URL for preview
      try {
        return URL.createObjectURL(file);
    } catch (error) {
      console.error("Error creating object URL for preview:", error);
      return null;
    }
  }

  try {
    const filePath = `public/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    return null;
    }
  },

  // Profile management methods
  async getUserProfile(userId: string) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      // Fallback to user metadata if profile table doesn't exist
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      return {
        id: userData.user?.id,
        email: userData.user?.email,
        first_name: userData.user?.user_metadata?.first_name,
        last_name: userData.user?.user_metadata?.last_name,
        full_name: userData.user?.user_metadata?.full_name,
        avatar_url: userData.user?.user_metadata?.avatar_url,
        created_at: userData.user?.created_at,
        updated_at: userData.user?.updated_at
      };
    }

    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<SignUpData>) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Update both the profiles table and user metadata
    const profileUpdates: any = {};
    const metadataUpdates: any = {};

    if (updates.firstName) {
      profileUpdates.first_name = updates.firstName;
      metadataUpdates.first_name = updates.firstName;
    }
    if (updates.lastName) {
      profileUpdates.last_name = updates.lastName;
      metadataUpdates.last_name = updates.lastName;
    }
    if (updates.firstName && updates.lastName) {
      profileUpdates.full_name = `${updates.firstName} ${updates.lastName}`.trim();
      metadataUpdates.full_name = `${updates.firstName} ${updates.lastName}`.trim();
    }

    // Update profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single();

    // Update user metadata
    const { data: userData, error: userError } = await supabase.auth.updateUser({
      data: metadataUpdates
    });

    if (profileError && userError) {
      throw new Error('Failed to update profile');
    }

    return { user: userData.user, error: profileError || userError };
  },

  // Delete user account
  async deleteUser() {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.rpc('delete_user_account');
    
    if (error) {
      throw error;
    }
    
    // Sign out after successful deletion
    await supabase.auth.signOut();
    
    return { error: null };
  },

  // Update user password
  async updatePassword(currentPassword: string, newPassword: string) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // First verify current password by signing in
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user?.email) {
      throw new Error('No user found');
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentUser.user.email,
      password: currentPassword
    });

    if (signInError) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    return { error };
  }
};

// Legacy function for backward compatibility
export const uploadImage = supabaseService.uploadImage;

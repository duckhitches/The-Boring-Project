-- Copyright (c) 2025 Eshan Vijay Shettennavar
-- 
-- This file is licensed under the Business Source License 1.1.
-- See LICENSE-PROPRIETARY.md for full license terms.
-- 
-- Commercial use of this codebase as a SaaS product without explicit permission is prohibited.

-- Corrected Supabase SQL Schema (without the problematic jwt_secret line)

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  timeline TEXT NOT NULL,
  description TEXT NOT NULL,
  code_snippet TEXT,
  code_language TEXT,
  screenshots TEXT[] DEFAULT '{}',
  github_link TEXT,
  live_link TEXT,
  contact_email TEXT NOT NULL,
  background_image TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
-- Users can only see their own projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-backgrounds', 'project-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public read access for project images" ON storage.objects
    FOR SELECT USING (bucket_id = 'project-backgrounds');

CREATE POLICY "Authenticated users can upload project images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-backgrounds' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own project images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'project-backgrounds' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own project images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'project-backgrounds' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

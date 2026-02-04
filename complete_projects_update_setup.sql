-- Copyright (c) 2025 Eshan Vijay Shettennavar
-- 
-- This file is licensed under the Business Source License 1.1.
-- See LICENSE-PROPRIETARY.md for full license terms.
-- 
-- Commercial use of this codebase as a SaaS product without explicit permission is prohibited.

-- Complete Projects Table Setup with Update Functionality
-- This ensures all policies and triggers are properly configured

-- Ensure the projects table exists with all required columns
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

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Public read access for sharing" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create comprehensive policies
-- 1. Public read access (for sharing)
CREATE POLICY "Public read access for sharing" ON projects
  FOR SELECT
  USING (true);

-- 2. Users can insert their own projects
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own projects
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own projects
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify the setup
-- Test queries (uncomment to test):
-- SELECT * FROM projects LIMIT 1; -- Should work for anyone (public read)
-- INSERT INTO projects (project_name, timeline, description, contact_email, user_id) VALUES ('Test', '1 week', 'Test project', 'test@example.com', auth.uid()); -- Should work for authenticated users
-- UPDATE projects SET description = 'Updated' WHERE id = 'some-id' AND user_id = auth.uid(); -- Should work for project owner
-- DELETE FROM projects WHERE id = 'some-id' AND user_id = auth.uid(); -- Should work for project owner

-- Check if trigger is working
-- UPDATE projects SET project_name = project_name WHERE id = 'some-id'; -- Should update updated_at timestamp

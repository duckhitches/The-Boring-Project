-- Copyright (c) 2025 Eshan Vijay Shettennavar
-- 
-- This file is licensed under the Business Source License 1.1.
-- See LICENSE-PROPRIETARY.md for full license terms.
-- 
-- Commercial use of this codebase as a SaaS product without explicit permission is prohibited.

-- Update RLS policies to allow public read access to projects for sharing
-- This allows anyone to view project details via shared links

-- Drop existing policies for projects table
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create new policies that allow public read access
-- Policy 1: Allow public read access to all projects (for sharing)
CREATE POLICY "Public read access for sharing" ON projects
  FOR SELECT
  USING (true);

-- Policy 2: Users can insert their own projects
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own projects
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own projects
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Verify the policies are working
-- You can test this by running:
-- SELECT * FROM projects LIMIT 1; -- Should work for anyone (public read)
-- INSERT INTO projects (...) VALUES (...); -- Should only work for authenticated users

-- Copyright (c) 2025 Eshan Vijay Shettennavar
-- 
-- This file is licensed under the Business Source License 1.1.
-- See LICENSE-PROPRIETARY.md for full license terms.
-- 
-- Commercial use of this codebase as a SaaS product without explicit permission is prohibited.

-- Test script to check specific user profile
-- Replace 'USER_ID_HERE' with the actual user_id from the debug logs

-- First, let's see what user_id is being used
SELECT 
  p.id as project_id,
  p.project_name,
  p.user_id,
  pr.first_name,
  pr.last_name,
  pr.email
FROM projects p
LEFT JOIN profiles pr ON p.user_id = pr.id
ORDER BY p.created_at DESC
LIMIT 5;

-- Check if the specific user has a profile
-- Replace 'YOUR_USER_ID' with the actual user_id from the debug logs
SELECT 
  'User Profile Check' as test,
  au.id as user_id,
  au.email as auth_email,
  au.raw_user_meta_data,
  pr.first_name,
  pr.last_name,
  pr.email as profile_email
FROM auth.users au
LEFT JOIN profiles pr ON au.id = pr.id
ORDER BY au.created_at DESC
LIMIT 3;

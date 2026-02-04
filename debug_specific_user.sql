-- Copyright (c) 2025 Eshan Vijay Shettennavar
-- 
-- This file is licensed under the Business Source License 1.1.
-- See LICENSE-PROPRIETARY.md for full license terms.
-- 
-- Commercial use of this codebase as a SaaS product without explicit permission is prohibited.

-- Quick test to check if your specific user has profile data
-- This will help us debug the exact issue

-- Check projects and their creators
SELECT 
  p.id as project_id,
  p.project_name,
  p.user_id,
  CASE 
    WHEN pr.id IS NOT NULL THEN 'Profile EXISTS'
    ELSE 'Profile MISSING'
  END as profile_status,
  pr.first_name,
  pr.last_name,
  pr.email as profile_email
FROM projects p
LEFT JOIN profiles pr ON p.user_id = pr.id
ORDER BY p.created_at DESC
LIMIT 5;

-- Check if your current user has a profile
-- This should show your profile data
SELECT 
  'Current User Profile Check' as test,
  au.id as user_id,
  au.email as auth_email,
  au.raw_user_meta_data->>'first_name' as metadata_first_name,
  au.raw_user_meta_data->>'last_name' as metadata_last_name,
  pr.first_name as profile_first_name,
  pr.last_name as profile_last_name,
  pr.email as profile_email
FROM auth.users au
LEFT JOIN profiles pr ON au.id = pr.id
WHERE au.email = 'YOUR_EMAIL_HERE'  -- Replace with your actual email
ORDER BY au.created_at DESC;

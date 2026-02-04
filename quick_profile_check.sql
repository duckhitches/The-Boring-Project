-- Copyright (c) 2025 Eshan Vijay Shettennavar
-- 
-- This file is licensed under the Business Source License 1.1.
-- See LICENSE-PROPRIETARY.md for full license terms.
-- 
-- Commercial use of this codebase as a SaaS product without explicit permission is prohibited.

-- Quick test to check profiles table
-- Run this in Supabase SQL Editor

-- Check if profiles table exists and has any data
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 1 END) as profiles_with_first_name,
  COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as profiles_with_last_name,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as profiles_with_email
FROM profiles;

-- Show sample profiles data
SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if there are users in auth.users
SELECT 
  COUNT(*) as total_users
FROM auth.users;

-- Show sample auth.users data
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

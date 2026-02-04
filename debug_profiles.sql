-- Copyright (c) 2025 Eshan Vijay Shettennavar
-- 
-- This file is licensed under the Business Source License 1.1.
-- See LICENSE-PROPRIETARY.md for full license terms.
-- 
-- Commercial use of this codebase as a SaaS product without explicit permission is prohibited.

-- Debug script to check profiles table and user data
-- Run this in Supabase SQL Editor to see what's happening

-- Check if profiles table exists and has data
SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any users in auth.users
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if the trigger function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

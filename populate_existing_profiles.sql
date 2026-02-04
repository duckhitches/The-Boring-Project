-- Copyright (c) 2025 Eshan Vijay Shettennavar
-- 
-- This file is licensed under the Business Source License 1.1.
-- See LICENSE-PROPRIETARY.md for full license terms.
-- 
-- Commercial use of this codebase as a SaaS product without explicit permission is prohibited.

-- Manually populate profiles for existing users
-- This will create profile records for users who don't have them yet

INSERT INTO profiles (id, email, first_name, last_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL  -- Only insert if profile doesn't exist
ON CONFLICT (id) DO NOTHING;

-- Update existing profiles with user metadata if they're empty
UPDATE profiles 
SET 
  first_name = COALESCE(NULLIF(profiles.first_name, ''), auth_users.raw_user_meta_data->>'first_name'),
  last_name = COALESCE(NULLIF(profiles.last_name, ''), auth_users.raw_user_meta_data->>'last_name'),
  email = COALESCE(NULLIF(profiles.email, ''), auth_users.email),
  updated_at = NOW()
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND (profiles.first_name = '' OR profiles.last_name = '' OR profiles.email = '');

-- Show the results
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

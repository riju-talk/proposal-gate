-- First, let's clean up existing profiles since we need to recreate them with proper auth user IDs
DELETE FROM public.profiles WHERE email IN ('admin@university.edu', 'coordinator@university.edu');

-- Note: We need to create actual Supabase auth users manually through the dashboard
-- This migration will prepare the profiles table structure
-- After running this, go to Supabase Auth dashboard to create users:
-- 1. admin@university.edu with password: admin123
-- 2. coordinator@university.edu with password: coord123

-- Then we'll insert profiles with the correct auth user IDs
-- Fix profiles table structure and insert admin profiles
-- First, update user_id for existing profiles
UPDATE public.profiles 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE auth.users.email = profiles.email 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Update role for admin users
UPDATE public.profiles 
SET role = CASE 
  WHEN email = 'admin@university.edu' THEN 'admin'
  WHEN email = 'coordinator@university.edu' THEN 'coordinator'
  ELSE 'user'
END;

-- Insert admin profiles for existing auth users that don't have profiles
INSERT INTO public.profiles (user_id, email, username, role) 
SELECT 
  u.id as user_id,
  u.email,
  CASE 
    WHEN u.email = 'admin@university.edu' THEN 'admin'
    WHEN u.email = 'coordinator@university.edu' THEN 'coordinator'
    ELSE SPLIT_PART(u.email, '@', 1)
  END as username,
  CASE 
    WHEN u.email = 'admin@university.edu' THEN 'admin'
    WHEN u.email = 'coordinator@university.edu' THEN 'coordinator'
    ELSE 'user'
  END as role
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL);
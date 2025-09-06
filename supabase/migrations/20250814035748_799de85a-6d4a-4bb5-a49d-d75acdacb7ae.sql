-- Add missing columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update profiles table to link to auth users properly
UPDATE public.profiles 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE auth.users.email = profiles.email 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- Add foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique constraint on user_id
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Update policies to use user_id
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = user_id);

-- Insert admin profiles for existing users
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
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL
ON CONFLICT (email) DO UPDATE SET 
  user_id = EXCLUDED.user_id,
  username = EXCLUDED.username,
  role = EXCLUDED.role;
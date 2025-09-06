-- Fix authentication configuration to send OTP codes instead of magic links
-- Create profiles table that links to auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = user_id);

-- Insert admin users into profiles table
INSERT INTO public.profiles (user_id, email, username, role) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@university.edu', 'admin', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'coordinator@university.edu', 'coordinator', 'coordinator')
ON CONFLICT (email) DO UPDATE SET 
  username = EXCLUDED.username,
  role = EXCLUDED.role;
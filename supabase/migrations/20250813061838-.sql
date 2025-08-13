-- Insert sample admin profiles for testing
INSERT INTO public.profiles (email, username, full_name) VALUES 
  ('admin@university.edu', 'admin', 'System Administrator'),
  ('coordinator@university.edu', 'coordinator', 'Event Coordinator')
ON CONFLICT (email) DO NOTHING;
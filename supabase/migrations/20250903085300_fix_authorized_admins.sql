-- Ensure the authorized_admins table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.authorized_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  approval_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert or update the authorized admin users
INSERT INTO public.authorized_admins (email, name, role, approval_order, is_active)
VALUES
  ('president@sc.iiitd.ac.in', 'President Student Council', 'president', 1, true),
  ('vp@sc.iiitd.ac.in', 'Vice-President Student Council', 'vice_president', 2, true),
  ('treasurer@sc.iiitd.ac.in', 'Treasurer Student Council', 'treasurer', 3, true),
  ('admin-saoffice@iiitd.ac.in', 'Admin SA Office', 'sa_office', 4, true),
  ('ravi@iiitd.ac.in', 'Ravi Bhasin', 'faculty_advisor', 5, true),
  ('smriti@iiitd.ac.in', 'Smriti Singh', 'final_approver', 6, true),
  ('rijusmit22400@iiitd.ac.in', 'Main Developer', 'developer', 0, true)
ON CONFLICT (email) 
DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  approval_order = EXCLUDED.approval_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

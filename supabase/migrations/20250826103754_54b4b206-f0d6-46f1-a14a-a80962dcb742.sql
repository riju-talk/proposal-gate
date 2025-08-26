-- Create authorized admins table
CREATE TABLE public.authorized_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  approval_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the authorized admin users
INSERT INTO public.authorized_admins (email, name, role, approval_order) VALUES
('president@sc.iiitd.ac.in', 'President Student Council', 'president', 1),
('vp@sc.iiitd.ac.in', 'Vice-President Student Council', 'vice_president', 2),
('treasurer@sc.iiitd.ac.in', 'Treasurer Student Council', 'treasurer', 3),
('admin-saoffice@iiitd.ac.in', 'Admin SA Office', 'sa_office', 4),
('ravi@iiitd.ac.in', 'Ravi Bhasin', 'faculty_advisor', 5),
('smriti@iiitd.ac.in', 'Smriti Singh', 'final_approver', 6),
('rijusmit22400@iiitd.ac.in', 'Main Developer', 'developer', 0);

-- Create event approvals table
CREATE TABLE public.event_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_proposal_id UUID NOT NULL REFERENCES public.event_proposals(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL REFERENCES public.authorized_admins(email),
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_proposal_id, admin_email)
);

-- Enable RLS on authorized_admins
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;

-- Enable RLS on event_approvals
ALTER TABLE public.event_approvals ENABLE ROW LEVEL SECURITY;

-- RLS policies for authorized_admins
CREATE POLICY "Anyone can view authorized admins" 
ON public.authorized_admins 
FOR SELECT 
USING (true);

-- RLS policies for event_approvals
CREATE POLICY "Anyone can view event approvals" 
ON public.event_approvals 
FOR SELECT 
USING (true);

CREATE POLICY "Authorized admins can insert approvals" 
ON public.event_approvals 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.authorized_admins 
    WHERE email = admin_email AND is_active = true
  )
);

CREATE POLICY "Authorized admins can update their own approvals" 
ON public.event_approvals 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.authorized_admins 
    WHERE email = admin_email AND is_active = true
  )
);

-- Create trigger for automatic timestamp updates on authorized_admins
CREATE TRIGGER update_authorized_admins_updated_at
BEFORE UPDATE ON public.authorized_admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on event_approvals
CREATE TRIGGER update_event_approvals_updated_at
BEFORE UPDATE ON public.event_approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize approvals for new event proposals
CREATE OR REPLACE FUNCTION public.initialize_event_approvals()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert pending approvals for all active authorized admins
  INSERT INTO public.event_approvals (event_proposal_id, admin_email, status)
  SELECT NEW.id, email, 'pending'
  FROM public.authorized_admins 
  WHERE is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create approvals when new event proposal is created
CREATE TRIGGER create_event_approvals_on_proposal
AFTER INSERT ON public.event_proposals
FOR EACH ROW
EXECUTE FUNCTION public.initialize_event_approvals();
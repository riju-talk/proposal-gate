-- Fix function search path security issue
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
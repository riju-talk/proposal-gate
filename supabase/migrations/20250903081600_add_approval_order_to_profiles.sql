-- Add approval_order column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_order INTEGER;

-- Update existing admin users with default approval order
UPDATE profiles 
SET approval_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM profiles 
  WHERE role = 'admin' AND is_email_verified = true
) as subquery
WHERE profiles.id = subquery.id;

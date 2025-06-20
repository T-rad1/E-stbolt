/*
  # Fix RLS policies for properties table to use correct auth functions

  1. Security Changes
    - Update RLS policies to properly check user metadata for admin role
    - Use auth.jwt() function to access user metadata
    - Ensure proper access control for CRUD operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert properties" ON properties;
DROP POLICY IF EXISTS "Only admins can update properties" ON properties;
DROP POLICY IF EXISTS "Only admins can delete properties" ON properties;

-- Create updated policies with metadata role checks
CREATE POLICY "Only admins can insert properties"
ON properties
FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
);

CREATE POLICY "Only admins can update properties"
ON properties
FOR UPDATE
TO authenticated
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
)
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
);

CREATE POLICY "Only admins can delete properties"
ON properties
FOR DELETE
TO authenticated
USING (
  auth.role() = 'authenticated' AND 
  (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
);
/*
  # Fix RLS policies for properties table

  1. Security Changes
    - Update RLS policies to properly handle admin role checks
    - Ensure proper access control for CRUD operations
    - Fix policy syntax for JWT role checking
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert properties" ON properties;
DROP POLICY IF EXISTS "Only admins can update properties" ON properties;
DROP POLICY IF EXISTS "Only admins can delete properties" ON properties;

-- Create updated policies with proper role checks
CREATE POLICY "Only admins can insert properties"
ON properties
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt()->>'role' = 'admin'
);

CREATE POLICY "Only admins can update properties"
ON properties
FOR UPDATE
TO authenticated
USING (
  auth.jwt()->>'role' = 'admin'
)
WITH CHECK (
  auth.jwt()->>'role' = 'admin'
);

CREATE POLICY "Only admins can delete properties"
ON properties
FOR DELETE
TO authenticated
USING (
  auth.jwt()->>'role' = 'admin'
);
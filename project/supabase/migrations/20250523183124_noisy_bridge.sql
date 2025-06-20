/*
  # Create properties table and policies

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `location` (text)
      - `images` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on properties table
    - Add policies for viewing, creating, updating, and deleting properties
*/

-- Create the properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  location text NOT NULL,
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for sorting by created_at
CREATE INDEX IF NOT EXISTS properties_created_at_idx ON properties (created_at DESC);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view properties" ON properties;
    DROP POLICY IF EXISTS "Only admins can insert properties" ON properties;
    DROP POLICY IF EXISTS "Only admins can update properties" ON properties;
    DROP POLICY IF EXISTS "Only admins can delete properties" ON properties;
END $$;

-- Create policies
CREATE POLICY "Anyone can view properties"
  ON properties
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Only admins can update properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Only admins can delete properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);
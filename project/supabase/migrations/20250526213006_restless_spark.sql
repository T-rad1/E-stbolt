/*
  # Add year_built column and storage policies

  1. Schema Changes
    - Add `year_built` column to properties table
    - Set default value to current year
    - Add check constraint to ensure valid years (>= 1800)
  
  2. Storage Policies
    - Enable storage access for authenticated users with admin role
    - Allow read access for all users
    - Allow write access for admin users only
*/

-- Add year_built column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'year_built'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN year_built integer 
    DEFAULT EXTRACT(year FROM CURRENT_DATE);

    ALTER TABLE properties 
    ADD CONSTRAINT properties_year_built_check 
    CHECK (year_built >= 1800);
  END IF;
END $$;

-- Storage bucket policies
DO $$
BEGIN
  -- Enable RLS for storage
  CREATE POLICY "Allow public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

  CREATE POLICY "Allow admin write access"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images' 
    AND (auth.jwt() ->> 'role')::text = 'admin'
  );

  CREATE POLICY "Allow admin delete access"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (auth.jwt() ->> 'role')::text = 'admin'
  );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
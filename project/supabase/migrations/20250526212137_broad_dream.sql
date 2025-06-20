/*
  # Add year_built column and storage policies

  1. Schema Changes
    - Add `year_built` column to properties table
      - Integer type
      - Default to current year
      - Check constraint to ensure valid years (>= 1800)
  
  2. Storage Policies
    - Enable storage access for authenticated users
    - Allow admin users to upload property images
*/

-- Add year_built column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'year_built'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN year_built integer 
    DEFAULT EXTRACT(year FROM CURRENT_DATE);

    ALTER TABLE properties 
    ADD CONSTRAINT properties_year_built_check 
    CHECK (year_built >= 1800);
  END IF;
END $$;

-- Update storage policies for property-images bucket
CREATE POLICY "Allow admin users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' 
  AND ((auth.jwt() ->> 'role'::text) = 'admin'::text)
);

CREATE POLICY "Allow admin users to delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND ((auth.jwt() ->> 'role'::text) = 'admin'::text)
);
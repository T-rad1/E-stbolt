/*
  # Update storage policies for multiple image uploads

  1. Storage
    - Ensure storage policies allow multiple file uploads
    - Maintain existing security rules
  
  2. Security
    - Allow authenticated users to upload multiple files
    - Maintain public read access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view property images" ON storage.objects;

-- Create updated storage policies
CREATE POLICY "Allow admins to upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
  AND (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
);

CREATE POLICY "Allow admins to delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
  AND (auth.jwt()->'user_metadata'->>'role')::text = 'admin'
);

CREATE POLICY "Allow public to view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Ensure the bucket exists and is public
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'property-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('property-images', 'property-images', true);
  END IF;
END $$;
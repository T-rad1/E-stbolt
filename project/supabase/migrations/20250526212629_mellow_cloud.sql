/*
  # Update storage policies for property images

  1. Storage
    - Creates policies for property image management
    - Ensures proper access control for admin users
  
  2. Security
    - Allows admin users to upload and delete images
    - Maintains public read access for all images
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view property images" ON storage.objects;

-- Create storage policies using storage API
CREATE POLICY "Allow admins to upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

CREATE POLICY "Allow admins to delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images'
  AND auth.role() = 'authenticated'
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

CREATE POLICY "Allow public to view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');
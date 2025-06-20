/*
  # Update storage policies for property images

  1. Storage
    - Updates storage policies to be more permissive
    - Ensures proper access control for image uploads
  
  2. Security
    - Allows authenticated users to upload and manage images
    - Maintains public read access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated insert" ON storage.objects;

-- Policy to allow authenticated users to upload files
CREATE POLICY "allow authenticated insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Policy to allow anyone to download/view files
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Policy to allow authenticated users to delete files
CREATE POLICY "Users can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');

-- Policy to allow authenticated users to update files
CREATE POLICY "Users can update property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images');
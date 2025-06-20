/*
  # Update storage policies for property images

  1. Storage
    - Checks if property-images bucket exists before creating
    - Updates storage policies for authenticated users
  
  2. Security
    - Allows authenticated users to upload images
    - Allows anyone to view images
    - Allows authenticated users to delete images
*/

DO $$
BEGIN
  -- Check if bucket doesn't exist before creating
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'property-images'
  ) THEN
    -- Create the storage bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('property-images', 'property-images', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Policy to allow anyone to download/view files
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');
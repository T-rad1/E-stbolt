/*
  # Create property images storage bucket

  1. Storage
    - Creates a new public bucket called 'property-images'
    - Sets up storage policies for authenticated users
  
  2. Security
    - Allows authenticated users to upload images
    - Allows anyone to view images
    - Only allows authenticated users to delete their own images
*/

-- Create the storage bucket
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true);

-- Policy to allow authenticated users to upload files
create policy "Authenticated users can upload property images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and (storage.foldername(name))[1] = 'properties'
);

-- Policy to allow anyone to download/view files
create policy "Anyone can view property images"
on storage.objects for select
to public
using (bucket_id = 'property-images');

-- Policy to allow authenticated users to delete their own files
create policy "Users can delete their own property images"
on storage.objects for delete
to authenticated
using (bucket_id = 'property-images');
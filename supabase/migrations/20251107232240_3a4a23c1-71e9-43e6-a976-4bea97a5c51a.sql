-- Create storage bucket for land listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('land-images', 'land-images', true);

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload land images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'land-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view images
CREATE POLICY "Anyone can view land images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'land-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their own land images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'land-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own land images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'land-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
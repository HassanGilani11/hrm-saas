-- Create the 'employees' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('employees', 'employees', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for the 'employees' bucket

-- 1. Allow public read access to all files in the 'employees' bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'employees' );

-- 2. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'employees' 
    AND auth.role() = 'authenticated'
);

-- 3. Allow authenticated users to update files (e.g. replace existing image)
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'employees' 
    AND auth.role() = 'authenticated'
);

-- 4. Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'employees' 
    AND auth.role() = 'authenticated'
);

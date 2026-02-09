-- Supabase Storage Setup for Passport Photos

-- 1. Create the storage bucket (via Supabase Dashboard)
--    - Go to: Storage > Create new bucket
--    - Name: student-assets
--    - Public: Yes (for easy access to passport photos)

-- 2. Set up Row Level Security (RLS) Policies
-- Allow authenticated users to upload their own passport photos
CREATE POLICY "Students can upload passport photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'student-assets' 
    AND auth.uid() IN (
        SELECT user_id FROM students
    )
);

-- Allow public read access to all passport photos
CREATE POLICY "Anyone can view passport photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-assets');

-- Allow students to update their own passport photos
CREATE POLICY "Students can update their passport photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'student-assets' 
    AND auth.uid() IN (
        SELECT user_id FROM students
    )
)
WITH CHECK (
    bucket_id = 'student-assets' 
    AND auth.uid() IN (
        SELECT user_id FROM students
    )
);

-- Allow students to delete their own passport photos
CREATE POLICY "Students can delete their passport photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'student-assets' 
    AND auth.uid() IN (
        SELECT user_id FROM students
    )
);

-- 1. Add pdf_url column to textbooks table
ALTER TABLE textbooks ADD COLUMN IF NOT EXISTS pdf_url text;

-- 2. Create storage bucket for textbook PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'textbook-pdfs',
  'textbook-pdfs',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policies

-- Allow authenticated users in the same academy to read files
CREATE POLICY "Academy members can read textbook PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'textbook-pdfs'
  AND (storage.foldername(name))[1] IN (
    SELECT academy_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- Allow authenticated users in the same academy to upload files
CREATE POLICY "Academy members can upload textbook PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'textbook-pdfs'
  AND (storage.foldername(name))[1] IN (
    SELECT academy_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- Only admins can delete textbook PDFs
CREATE POLICY "Admins can delete textbook PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'textbook-pdfs'
  AND (storage.foldername(name))[1] IN (
    SELECT academy_id::text FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

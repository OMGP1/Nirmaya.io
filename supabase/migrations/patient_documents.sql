-- Patient Documents Table & Policies
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/ibzeknzhdemrxrwnrvdy/sql

CREATE TABLE IF NOT EXISTS patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  description TEXT,
  document_type TEXT DEFAULT 'other',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;

-- Patients can CRUD their own documents
CREATE POLICY "patients_manage_own_docs"
  ON patient_documents FOR ALL
  USING (auth.uid() = patient_id);

-- Doctors can read documents of patients they have appointments with
CREATE POLICY "doctors_view_patient_docs"
  ON patient_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = patient_documents.patient_id
      AND d.user_id = auth.uid()
    )
  );

-- Storage policies for bucket: medical-documents
CREATE POLICY "patients_upload_docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "patients_read_own_docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "patients_delete_own_docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "doctors_read_patient_storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-documents'
    AND EXISTS (
      SELECT 1 FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id::text = (storage.foldername(name))[1]
      AND d.user_id = auth.uid()
    )
  );

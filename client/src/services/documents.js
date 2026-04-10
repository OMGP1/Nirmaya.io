/**
 * Document Service — Supabase Storage + Metadata
 *
 * Handles patient document upload, listing, and deletion
 * using the `medical-documents` storage bucket and the
 * `patient_documents` metadata table.
 */
import { supabase } from '@/lib/supabase';

const BUCKET = 'medical-documents';

/**
 * Upload a document file and create metadata record
 */
export async function uploadDocument(file, userId, description = '', documentType = 'other') {
  const filePath = `${userId}/${Date.now()}_${file.name}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // 2. Insert metadata row
  const { data, error: insertError } = await supabase
    .from('patient_documents')
    .insert({
      patient_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      description,
      document_type: documentType,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return data;
}

/**
 * Get all documents for a patient
 */
export async function getPatientDocuments(patientId) {
  const { data, error } = await supabase
    .from('patient_documents')
    .select('*')
    .eq('patient_id', patientId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a signed download URL for a document
 */
export async function getDocumentUrl(filePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Delete a document (storage + metadata)
 */
export async function deleteDocument(id, filePath) {
  // Remove from storage
  await supabase.storage.from(BUCKET).remove([filePath]);

  // Remove metadata
  const { error } = await supabase
    .from('patient_documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

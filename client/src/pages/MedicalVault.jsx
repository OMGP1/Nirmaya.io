/**
 * MedicalVault — Patient Document Upload & FHIR Records
 *
 * Patients can upload prescriptions, lab reports, imaging, etc.
 * Documents are stored in Supabase Storage with metadata in patient_documents table.
 */
import { useState, useEffect, useRef } from 'react';
import PatientSidebar from '@/components/layout/PatientSidebar';
import { useAuth } from '@/hooks/useAuth';
import { uploadDocument, getPatientDocuments, getDocumentUrl, deleteDocument } from '@/services/documents';
import {
  ShieldCheck, Download, FileText, CheckCircle, ExternalLink,
  Upload, Trash2, Eye, File, Image, X, Plus, AlertCircle,
} from 'lucide-react';

const DOC_TYPE_OPTIONS = [
  { value: 'prescription', label: 'Prescription' },
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'imaging', label: 'Imaging / X-Ray' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'other', label: 'Other' },
];

const FILE_ICON = {
  'application/pdf': FileText,
  'image/png': Image,
  'image/jpeg': Image,
  'image/jpg': Image,
  default: File,
};

const MedicalVault = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadType, setUploadType] = useState('other');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  // Fetch documents
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const docs = await getPatientDocuments(user.id);
        setDocuments(docs);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        setError('Could not load documents');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setShowUpload(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;
    setUploading(true);
    setError(null);
    try {
      const doc = await uploadDocument(selectedFile, user.id, uploadDesc, uploadType);
      setDocuments(prev => [doc, ...prev]);
      setShowUpload(false);
      setSelectedFile(null);
      setUploadDesc('');
      setUploadType('other');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed — please try again');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (doc) => {
    try {
      const url = await getDocumentUrl(doc.file_path);
      window.open(url, '_blank');
    } catch (err) {
      alert('Could not generate document link');
    }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.file_name}"?`)) return;
    try {
      await deleteDocument(doc.id, doc.file_path);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const getTypeColor = (type) => {
    const colors = {
      prescription: 'bg-blue-50 text-blue-600 border-blue-200',
      lab_report: 'bg-green-50 text-green-600 border-green-200',
      imaging: 'bg-purple-50 text-purple-600 border-purple-200',
      discharge_summary: 'bg-amber-50 text-amber-600 border-amber-200',
      other: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-row overflow-hidden relative">
      <PatientSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white border-b border-slate-200 px-8 pt-16 pb-6 sm:py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#008080]/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#008080]" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-black text-[#1A2B48]">Health Vault</h1>
              <p className="text-xs text-slate-500">FHIR R4 • AES-256 Encrypted</p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-[#008080] text-white text-sm font-bold rounded-xl shadow-sm hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />
        </header>

        <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Upload Modal */}
          {showUpload && selectedFile && (
            <div className="bg-white rounded-2xl border-2 border-[#008080]/30 shadow-lg p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-black text-[#1A2B48] uppercase tracking-wider">Upload Document</h3>
                <button onClick={() => { setShowUpload(false); setSelectedFile(null); }} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <FileText className="w-5 h-5 text-[#008080]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1A2B48] truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Document Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1A2B48] focus:ring-2 focus:ring-[#008080] outline-none"
                  >
                    {DOC_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                  <input
                    type="text"
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="e.g. Blood panel results from Dr. Sharma"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#1A2B48] placeholder:text-slate-300 focus:ring-2 focus:ring-[#008080] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowUpload(false); setSelectedFile(null); }} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-[#1A2B48]">Cancel</button>
                <button onClick={handleUpload} disabled={uploading} className="px-6 py-2.5 bg-[#008080] text-white text-sm font-bold rounded-xl shadow-sm hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-2">
                  {uploading ? <><span className="animate-spin">⏳</span> Uploading...</> : <><Upload className="w-4 h-4" /> Upload</>}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-3xl font-heading font-black text-[#008080]">{documents.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Documents Uploaded</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
              <p className="text-3xl font-heading font-black text-[#1A2B48]">
                {documents.length > 0 ? formatDate(documents[0]?.uploaded_at) : '—'}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Last Upload</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-heading font-black text-green-600">Encrypted</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">AES-256</p>
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-[#1A2B48]">My Documents</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-bold text-[#008080] hover:bg-[#008080]/5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-400">Loading documents...</div>
            ) : documents.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {documents.map((doc) => {
                  const IconComp = FILE_ICON[doc.file_type] || FILE_ICON.default;
                  return (
                    <div key={doc.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-[#008080]/10 flex items-center justify-center shrink-0">
                          <IconComp className="w-5 h-5 text-[#008080]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#1A2B48] truncate">{doc.file_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase border ${getTypeColor(doc.document_type)}`}>{doc.document_type?.replace('_', ' ')}</span>
                            {doc.description && <span className="text-xs text-slate-400 truncate">{doc.description}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-xs text-slate-400 hidden sm:block">{formatSize(doc.file_size)}</span>
                        <span className="text-xs text-slate-400 hidden sm:block">{formatDate(doc.uploaded_at)}</span>
                        <button onClick={() => handleView(doc)} className="p-2 hover:bg-[#008080]/10 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-[#008080]" />
                        </button>
                        <button onClick={() => handleDelete(doc)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-sm">No documents uploaded yet</p>
                <p className="text-xs mt-1">Upload prescriptions, lab reports, or medical records</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-[#008080] text-white text-sm font-bold rounded-xl shadow-sm hover:brightness-110 transition-all"
                >
                  <Upload className="w-4 h-4" /> Upload First Document
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalVault;

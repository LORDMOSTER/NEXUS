import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CustomSelect from '../components/CustomSelect';
import useAuthStore from '../store/useAuthStore';

export default function Archives() {
  const [archives, setArchives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name-asc', 'name-desc'
  const [generatingKeyId, setGeneratingKeyId] = useState(null);
  const deleteExam = useAuthStore(state => state.deleteExam);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteArchive = (recordId) => {
    setConfirmDeleteId(recordId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const recordId = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(recordId);
    const success = await deleteExam(recordId);
    if (success) {
      setArchives(prev => prev.filter(r => r._id !== recordId));
    } else {
      alert('Failed to delete exam.');
    }
    setDeletingId(null);
  };

  // Fetch data from the live database
  useEffect(() => {
    const fetchArchives = async () => {
      try {
        // Attempt to fetch from your actual backend
        const response = await axios.get('http://localhost:5000/api/export/archives');
        if (response.data.success) {
          setArchives(response.data.records);
        }
      } catch (error) {
        console.warn("Backend not reachable, loading fallback data.");
        // Fallback mock data with timestamps
        setArchives([
          { _id: '1', code: 'CS3591', name: 'Computer Networks', type: 'CAT-1', status: 'LOCKED', createdAt: '2025-10-12T09:30:00Z', updatedAt: '2025-10-12T10:15:00Z' },
          { _id: '2', code: 'CS3351', name: 'Digital Principles and Computer Organization', type: 'End Semester', status: 'LOCKED', createdAt: '2025-11-05T14:00:00Z', updatedAt: '2025-11-05T14:45:00Z' },
          { _id: '3', code: 'CS3451', name: 'Introduction to Operating Systems', type: 'CAT-2', status: 'LOCKED', createdAt: '2025-09-22T08:00:00Z', updatedAt: '2025-09-23T09:10:00Z' },
          { _id: '4', code: 'CS3391', name: 'Object Oriented Programming', type: 'CAT-1', status: 'LOCKED', createdAt: '2025-08-15T11:20:00Z', updatedAt: '2025-08-15T11:20:00Z' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchives();
  }, []);

  // Format timestamp to readable string
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Handle Downloads
  const handleDownload = async (recordId, type) => {
    if (type === 'key') {
      setGeneratingKeyId(recordId);
      try {
        // Send a request to generate the answer key via Gemini
        const response = await axios.post('http://localhost:5000/api/export/answer-key', { 
          examId: recordId,
          // NOTE: If your DB isn't saving HTML yet, you may need to pass mock HTML here for testing
          htmlContent: "Pass the exam HTML here or fetch it inside the backend using examId." 
        });
        
        if (response.data.success) {
          const blob = new Blob([response.data.answerKey], { type: 'text/markdown' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `Grading_Rubric_${recordId}.md`;
          link.click();
        }
      } catch (error) {
        console.error("Failed to generate Grading Key", error);
        alert("Failed to synthesize grading key. Check backend logs.");
      }
      setGeneratingKeyId(null);
    } else if (type === 'pdf') {
      try {
        const response = await axios.get(`http://localhost:5000/api/export/download/pdf/${recordId}`, {
          responseType: 'blob' // Critical: tells axios to expect a binary file, not JSON
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Exam_Paper_${recordId}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("PDF Download failed", error);
        alert("Failed to download PDF. Please check server connection.");
      }
    }
  };

  // Filter and Sort Logic
  const processedRecords = useMemo(() => {
    let filtered = archives.filter(record => 
      record.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [archives, searchTerm, sortBy]);

  return (
    <div className="max-w-6xl mx-auto w-full pb-12 animate-in fade-in duration-500">
      
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-[var(--text-main)]">Document Archives</h1>
        <p className="text-[var(--text-muted)] text-lg">Secure repository of all generated and finalized examination records.</p>
      </div>

      {/* Controls Bar */}
      <div className="soft-surface p-6 rounded-[24px] mb-8 flex flex-col md:flex-row gap-4 items-center z-10 relative">
        <div className="flex-1 w-full relative">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search by Subject Code or Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="soft-inset w-full pl-12 pr-4 py-4 text-sm font-medium text-[var(--text-main)] outline-none"
          />
        </div>
        
        <div className="relative min-w-[200px] w-full md:w-auto">
          <CustomSelect 
            value={sortBy}
            onChange={setSortBy}
            className="soft-button w-full pl-4 pr-4 py-4 rounded-xl font-bold text-[var(--text-main)]"
            options={[
              { value: 'newest', label: 'Sort by: Newest First' },
              { value: 'oldest', label: 'Sort by: Oldest First' },
              { value: 'name-asc', label: 'Sort by: Name (A-Z)' },
              { value: 'name-desc', label: 'Sort by: Name (Z-A)' },
            ]}
          />
        </div>
      </div>

      {/* Archive List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="soft-surface p-12 rounded-[24px] flex flex-col justify-center items-center gap-4">
            <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Fetching records...</p>
          </div>
        ) : (
          <>
            {processedRecords.map((record) => (
              <div key={record._id} className="soft-surface p-6 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between group transition-transform hover:-translate-y-1 hover:shadow-xl gap-4 md:gap-0">
                
                {/* Record Info */}
                <div className="flex items-center gap-6 flex-1 min-w-0 pr-0 md:pr-4">
                  {/* Premium Document Icon instead of text */}
                  <div className="soft-inset min-w-[64px] w-16 h-16 rounded-2xl flex items-center justify-center text-[var(--accent)] shadow-inner flex-shrink-0">
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="text-[var(--accent)] font-extrabold tracking-widest text-xs uppercase">{record.code}</span>
                      <span className="text-xs font-bold text-[var(--text-main)] bg-[var(--text-main)]/10 px-2 py-0.5 rounded uppercase">{record.type}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                              record.status === 'LOCKED'
                                ? 'text-[var(--success)] bg-[var(--success-bg)] border-[var(--success-border)]'
                                : 'text-[var(--warning)] bg-[var(--warning-bg)] border-[var(--warning-border)]'
                            }`}>{record.status}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-main)] mb-2 leading-tight truncate">{record.name}</h3>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs font-medium text-[var(--text-muted)]">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Created: {formatTime(record.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Last Edited: {formatTime(record.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-0 opacity-100 lg:opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
                     <button 
                       onClick={() => handleDownload(record._id, 'key')}
                       disabled={generatingKeyId === record._id}
                       title="Generate AI Grading Key"
                       className="soft-button w-36 px-4 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 text-[var(--text-main)] disabled:opacity-50"
                     >
                       {generatingKeyId === record._id ? (
                         <>
                           <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                           <span>Working...</span>
                         </>
                       ) : (
                         <>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                           Grading Key
                         </>
                       )}
                     </button>
                     <button 
                       onClick={() => handleDownload(record._id, 'pdf')}
                       title="Download Encrypted PDF"
                       className="soft-button w-36 px-4 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 text-[var(--accent)]"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                       Encrypted PDF
                     </button>
                     <button
                       onClick={() => handleDeleteArchive(record._id)}
                       disabled={deletingId === record._id}
                       title="Permanently delete this record"
                       className="soft-button w-11 px-3 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors disabled:opacity-50"
                     >
                       {deletingId === record._id ? (
                         <div className="w-5 h-5 border-2 border-[var(--danger)] border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       )}
                     </button>
                  </div>
              </div>
            ))}
            
            {processedRecords.length === 0 && (
              <div className="soft-surface p-16 rounded-[24px] text-center flex flex-col items-center gap-4">
                <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>No archives found</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  {searchTerm ? `No records match "${searchTerm}"` : 'Lock and export an exam to see it here.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="soft-surface p-6 rounded-[24px] max-w-md w-full shadow-2xl border border-red-500/20">
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Delete Archive</h3>
            <p className="text-[var(--text-muted)] mb-6">Are you sure you want to permanently delete this exam? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

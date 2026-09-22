import React, { useState, useEffect } from 'react';
import api from '../api';
import { Edit2, Trash2, Plus, X, Book } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '../components/DeleteModal';
import SyllabusManagerModal from '../components/SyllabusManagerModal';

function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState(null);
  
  // Form State
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [regulationYear, setRegulationYear] = useState('2021');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to load subjects');
    }
    setIsLoading(false);
  };

  const openModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectCode(subject.subjectCode);
      setSubjectName(subject.subjectName);
      setRegulationYear(subject.regulationYear || '2021');
    } else {
      setEditingSubject(null);
      setSubjectCode('');
      setSubjectName('');
      setRegulationYear('2021');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectCode || !subjectName) {
      toast.error('Subject Code and Name are required');
      return;
    }

    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject._id}`, {
          subjectCode,
          subjectName,
          regulationYear
        });
        toast.success('Subject updated successfully');
      } else {
        await api.post('/subjects', {
          subjectCode,
          subjectName,
          regulationYear
        });
        toast.success('Subject created successfully');
      }
      fetchSubjects();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving subject');
    }
  };

  const confirmDelete = (id) => {
    setSubjectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    
    try {
      await api.delete(`/subjects/${subjectToDelete}`);
      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
    setIsDeleteModalOpen(false);
    setSubjectToDelete(null);
  };

  const openSyllabusManager = (subject) => {
    setActiveSubject(subject);
    setIsSyllabusModalOpen(true);
  };

  const handleSyllabusUpdate = (updatedSubject) => {
    setSubjects(subjects.map(s => s._id === updatedSubject._id ? updatedSubject : s));
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Manage Subjects</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Add, edit, or remove subjects for your department.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[var(--accent)] text-white shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      <div className="soft-surface rounded-3xl p-6 overflow-hidden flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-60">
            <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No subjects found in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-rim)' }}>
                  <th className="py-3 px-4 font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Code</th>
                  <th className="py-3 px-4 font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Name</th>
                  <th className="py-3 px-4 font-bold text-sm tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Reg Year</th>
                  <th className="py-3 px-4 font-bold text-sm tracking-widest uppercase text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject._id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottom: '1px solid var(--border-rim)' }}>
                    <td className="py-4 px-4 font-bold" style={{ color: 'var(--accent)' }}>{subject.subjectCode}</td>
                    <td className="py-4 px-4 font-semibold" style={{ color: 'var(--text-main)' }}>{subject.subjectName}</td>
                    <td className="py-4 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>{subject.regulationYear}</td>
                    <td className="py-4 px-4 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => openSyllabusManager(subject)}
                        className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors"
                        title="Manage Syllabus"
                      >
                        <Book size={16} />
                      </button>
                      <button 
                        onClick={() => openModal(subject)}
                        className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(subject._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="soft-surface w-full max-w-md p-8 rounded-[32px] shadow-2xl relative">
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Subject Code</label>
                <input 
                  type="text" 
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full soft-inset p-3 rounded-xl font-medium outline-none"
                  style={{ color: 'var(--text-main)' }}
                  placeholder="e.g., CS3451"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Subject Name</label>
                <input 
                  type="text" 
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full soft-inset p-3 rounded-xl font-medium outline-none"
                  style={{ color: 'var(--text-main)' }}
                  placeholder="e.g., Operating Systems"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Regulation Year</label>
                <input 
                  type="text" 
                  value={regulationYear}
                  onChange={(e) => setRegulationYear(e.target.value)}
                  className="w-full soft-inset p-3 rounded-xl font-medium outline-none"
                  style={{ color: 'var(--text-main)' }}
                  placeholder="e.g., 2021"
                />
              </div>

              <button 
                type="submit"
                className="mt-4 w-full py-3 rounded-xl font-bold bg-[var(--accent)] text-white hover:scale-[1.02] transition-transform"
              >
                {editingSubject ? 'Update Subject' : 'Create Subject'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subject?"
        message="Are you sure you want to delete this subject? This action will permanently remove its syllabus as well."
      />

      {/* Syllabus Manager Modal */}
      <SyllabusManagerModal 
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        subject={activeSubject}
        onSyllabusUpdate={handleSyllabusUpdate}
      />
    </div>
  );
}

export default ManageSubjects;

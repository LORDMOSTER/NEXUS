import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Edit2, Check, Trash2, Book } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api';

function SyllabusManagerModal({ isOpen, onClose, subject, onSyllabusUpdate }) {
  const [syllabus, setSyllabus] = useState([]);
  const [editingUnitId, setEditingUnitId] = useState(null);
  
  // Form State for editing/adding
  const [unitNumber, setUnitNumber] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [unitText, setUnitText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (subject) {
      setSyllabus(subject.syllabus || []);
    }
  }, [subject]);

  if (!isOpen || !subject) return null;

  const handleAddUnit = () => {
    const newUnit = {
      _id: 'new_' + Date.now(),
      unitNumber: syllabus.length + 1,
      title: '',
      text: '',
      isNew: true
    };
    setSyllabus([...syllabus, newUnit]);
    startEditing(newUnit);
  };

  const startEditing = (unit) => {
    setEditingUnitId(unit._id);
    setUnitNumber(unit.unitNumber);
    setUnitTitle(unit.title);
    setUnitText(unit.text);
  };

  const cancelEditing = (unitId) => {
    setEditingUnitId(null);
    // If it was a new unit that wasn't saved, remove it
    if (unitId.toString().startsWith('new_')) {
      setSyllabus(syllabus.filter(u => u._id !== unitId));
    }
  };

  const saveUnit = (unitId) => {
    if (!unitTitle.trim() || !unitText.trim()) {
      toast.error('Title and content are required.');
      return;
    }

    const updatedSyllabus = syllabus.map(u => {
      if (u._id === unitId) {
        return {
          ...u,
          unitNumber: parseInt(unitNumber, 10) || u.unitNumber,
          title: unitTitle,
          text: unitText,
          isNew: false
        };
      }
      return u;
    });

    setSyllabus(updatedSyllabus);
    setEditingUnitId(null);
  };

  const deleteUnit = (unitId) => {
    setSyllabus(syllabus.filter(u => u._id !== unitId));
  };

  const saveToDatabase = async () => {
    setIsSaving(true);
    try {
      // Remove temporary _id fields from new units before sending to DB
      const cleanSyllabus = syllabus.map(({ _id, isNew, ...rest }) => 
        _id && _id.toString().startsWith('new_') ? rest : { _id, ...rest }
      );

      const response = await api.put(`/subjects/${subject._id}`, {
        ...subject,
        syllabus: cleanSyllabus
      });

      toast.success('Syllabus updated successfully');
      onSyllabusUpdate(response.data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save syllabus');
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative soft-surface p-6 sm:p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-rim)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <Book size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Syllabus Manager</h2>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {subject.subjectCode} - {subject.subjectName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {syllabus.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 opacity-60">
              <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No syllabus units found.</p>
              <button 
                onClick={handleAddUnit}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
              >
                <Plus size={16} /> Add First Unit
              </button>
            </div>
          ) : (
            syllabus.map((unit, index) => (
              <div key={unit._id || index} className="p-5 rounded-2xl border transition-all" style={{ borderColor: 'var(--border-rim)', background: 'var(--surface-color)' }}>
                {editingUnitId === (unit._id || index) ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <div className="w-24">
                        <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Unit No.</label>
                        <input 
                          type="number" 
                          value={unitNumber}
                          onChange={(e) => setUnitNumber(e.target.value)}
                          className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--accent)] rounded-lg p-2.5 text-sm outline-none transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Title</label>
                        <input 
                          type="text" 
                          value={unitTitle}
                          onChange={(e) => setUnitTitle(e.target.value)}
                          className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--accent)] rounded-lg p-2.5 text-sm outline-none transition-all"
                          placeholder="e.g. COMBINATIONAL LOGIC"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Content</label>
                      <textarea 
                        value={unitText}
                        onChange={(e) => setUnitText(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--accent)] rounded-lg p-3 text-sm outline-none transition-all min-h-[100px] resize-y"
                        placeholder="Topics covered in this unit..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => cancelEditing(unit._id || index)} className="px-4 py-2 rounded-lg font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm">
                        Cancel
                      </button>
                      <button onClick={() => saveUnit(unit._id || index)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity text-sm">
                        <Check size={16} /> Save Unit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                        <span className="text-[var(--accent)] mr-2">Unit {unit.unitNumber}</span>
                        {unit.title}
                      </h3>
                      <div className="flex gap-2">
                        <button onClick={() => startEditing(unit)} className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteUnit(unit._id || index)} className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {unit.text}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--border-rim)' }}>
          <button 
            onClick={handleAddUnit}
            disabled={editingUnitId !== null}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            <Plus size={18} /> Add Unit
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold bg-transparent border-2 border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-colors"
            >
              Close
            </button>
            <button 
              onClick={saveToDatabase}
              disabled={isSaving || editingUnitId !== null}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 shadow-lg hover:shadow-green-500/25 transition-all"
            >
              {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SyllabusManagerModal;

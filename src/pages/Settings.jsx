import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import CustomSelect from '../components/CustomSelect';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [defaultMarks, setDefaultMarks] = useState('100');
  const [defaultDuration, setDefaultDuration] = useState('3');

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const success = await updateProfile(name);
    setIsUpdating(false);
    if (success) toast.success('Profile updated successfully');
    else toast.error('Failed to update profile');
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-16 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--text-main)' }}>Platform Settings</h1>
        <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Manage your institutional profile, assessment defaults, and AI constraints.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <div className="soft-surface-raised p-8 rounded-[32px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Institutional Profile
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Faculty ID (Locked)
                </label>
                <input type="text" disabled value={user?.structuredId || '7321CSE001'} className="soft-inset w-full px-4 py-3 text-sm opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="soft-inset w-full px-4 py-3 text-sm" style={{ color: 'var(--text-main)' }} />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  Department (Locked)
                </label>
                <input type="text" disabled value={user?.departmentCode || 'Computer Science and Engineering'} className="soft-inset w-full px-4 py-3 text-sm opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <button onClick={handleUpdateProfile} disabled={isUpdating} className="soft-button w-full mt-8 py-3 rounded-xl font-bold disabled:opacity-50" style={{ color: 'var(--text-main)' }}>
              {isUpdating ? 'Updating...' : 'Update Profile Details'}
            </button>
          </div>
          <div className="soft-surface-raised p-8 rounded-[32px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              Assessment Defaults
            </h2>
            <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>Set your standard parameters to save time during creation.</p>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Default Max Marks</label>
                <CustomSelect value={defaultMarks} onChange={setDefaultMarks} className="soft-inset w-full px-4 py-3 text-sm rounded-xl"
                  options={[{ value: '100', label: '100 Marks (Standard)' }, { value: '50', label: '50 Marks (Internal)' }]} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Default Duration</label>
                <CustomSelect value={defaultDuration} onChange={setDefaultDuration} className="soft-inset w-full px-4 py-3 text-sm rounded-xl"
                  options={[{ value: '3', label: '3 Hours' }, { value: '2', label: '2 Hours' }, { value: '1.5', label: '1.5 Hours' }]} />
              </div>
            </div>
            <button className="soft-button w-full mt-8 py-3 rounded-xl font-bold" style={{ color: 'var(--text-main)' }}>Save Preferences</button>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="soft-surface-raised p-8 rounded-[32px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Security &amp; Access
            </h2>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center soft-inset p-4 rounded-2xl">
                <div>
                  <span className="block text-sm font-bold" style={{ color: 'var(--text-main)' }}>PDF Encryption Key</span>
                  <span className="block text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Deterministic (TeacherID+SubCode)</span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full border"
                  style={{ color: 'var(--success)', background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>ACTIVE</span>
              </div>
              <button className="soft-button w-full mt-2 py-3 rounded-xl text-sm font-bold text-left px-5" style={{ color: 'var(--text-main)' }}>
                Change Account Password
              </button>
            </div>
          </div>
          <div className="soft-surface-raised p-8 rounded-[32px] relative overflow-hidden select-none" style={{ opacity: 0.68, pointerEvents: 'none' }}>
            <div className="absolute top-4 right-5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)', background: 'var(--surface-inset)' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Admin Controlled
            </div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              Llama 3.2 Guardrails
            </h2>
            <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
              These parameters control the deterministic output of the local Ollama instance. Locked by the Administrator.
            </p>
            <div className="flex flex-col gap-4">
              {[['Temperature (Creativity)', '0.35'], ['Repeat Penalty', '1.15'], ['Max Predict Tokens', '3500']].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center soft-inset p-4 rounded-2xl">
                  <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{label}</span>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded border"
                    style={{ color: 'var(--accent)', background: 'rgba(0,0,0,0.15)', borderColor: 'var(--border-rim)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="soft-surface-raised p-8 rounded-[32px] border" style={{ borderColor: 'var(--danger-border)' }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--danger)' }}>Danger Zone</h2>
            <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>Actions here cannot be undone.</p>
            <button className="w-full py-3 rounded-xl font-bold transition-colors border"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}>
              Revoke Session &amp; Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

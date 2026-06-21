export default function Settings() {
  return (
    <div className="max-w-7xl mx-auto w-full pb-16 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-[var(--text-main)]">Platform Settings</h1>
        <p className="text-[var(--text-muted)] text-lg">Manage your institutional profile, assessment defaults, and AI constraints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Profile & Defaults */}
        <div className="flex flex-col gap-8">
          
          {/* Institutional Profile */}
          <div className="soft-surface p-8 rounded-[32px]">
            <h2 className="text-xl font-bold text-[var(--accent)] mb-6 flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
               Institutional Profile
            </h2>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Faculty ID (Locked)</label>
                <input type="text" disabled value="7321CSE001" className="soft-inset w-full px-4 py-3 text-sm opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" defaultValue="Dr. A. Chandrasekar" className="soft-inset w-full px-4 py-3 text-sm text-[var(--text-main)]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Department</label>
                <input type="text" disabled value="Computer Science and Engineering" className="soft-inset w-full px-4 py-3 text-sm opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <button className="soft-button w-full mt-8 py-3 rounded-xl font-bold text-[var(--text-main)]">
              Update Profile Details
            </button>
          </div>

          {/* Default Assessment Parameters */}
          <div className="soft-surface p-8 rounded-[32px]">
            <h2 className="text-xl font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
               Assessment Defaults
            </h2>
            <p className="text-sm font-medium text-[var(--text-muted)] mb-6">Set your standard parameters to save time during creation.</p>
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Default Max Marks</label>
                <select className="soft-inset w-full px-4 py-3 text-sm text-[var(--text-main)] appearance-none cursor-pointer">
                  <option value="100">100 Marks (Standard)</option>
                  <option value="50">50 Marks (Internal)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Default Duration</label>
                <select className="soft-inset w-full px-4 py-3 text-sm text-[var(--text-main)] appearance-none cursor-pointer">
                  <option value="3">3 Hours</option>
                  <option value="2">2 Hours</option>
                  <option value="1.5">1.5 Hours</option>
                </select>
              </div>
            </div>
            <button className="soft-button w-full mt-8 py-3 rounded-xl font-bold text-[var(--text-main)]">
              Save Preferences
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: AI, Security & Danger */}
        <div className="flex flex-col gap-8">
          
          {/* Security & Access */}
          <div className="soft-surface p-8 rounded-[32px]">
            <h2 className="text-xl font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               Security & Access
            </h2>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center soft-inset p-4 rounded-2xl">
                <div>
                  <span className="block text-sm font-bold text-[var(--text-main)]">PDF Encryption Key</span>
                  <span className="block text-xs font-medium text-[var(--text-muted)] mt-0.5">Deterministic (TeacherID+SubCode)</span>
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">ACTIVE</span>
              </div>
              <button className="soft-button w-full mt-2 py-3 rounded-xl text-sm font-bold text-[var(--text-main)] text-left px-5">
                Change Account Password
              </button>
            </div>
          </div>

          {/* AI Engine Guardrails */}
          <div className="soft-surface p-8 rounded-[32px]">
            <h2 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
               Llama 3.2 Guardrails
            </h2>
            <p className="text-sm font-medium text-[var(--text-muted)] mb-6">
              These parameters control the deterministic output of the local Ollama instance. They are locked by the Administrator.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center soft-inset p-4 rounded-2xl">
                <span className="text-sm font-bold text-[var(--text-main)]">Temperature (Creativity)</span>
                <span className="text-xs font-mono font-bold text-[var(--accent)] bg-black/20 px-2 py-1 rounded border border-[var(--border-rim)]">0.35</span>
              </div>
              <div className="flex justify-between items-center soft-inset p-4 rounded-2xl">
                <span className="text-sm font-bold text-[var(--text-main)]">Repeat Penalty</span>
                <span className="text-xs font-mono font-bold text-[var(--accent)] bg-black/20 px-2 py-1 rounded border border-[var(--border-rim)]">1.15</span>
              </div>
              <div className="flex justify-between items-center soft-inset p-4 rounded-2xl">
                <span className="text-sm font-bold text-[var(--text-main)]">Max Predict Tokens</span>
                <span className="text-xs font-mono font-bold text-[var(--accent)] bg-black/20 px-2 py-1 rounded border border-[var(--border-rim)]">3500</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="soft-surface p-8 rounded-[32px] border border-red-500/20">
            <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm font-medium text-[var(--text-muted)] mb-6">Actions here cannot be undone.</p>
            <button className="w-full py-3 rounded-xl font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20 shadow-inner">
              Revoke Session & Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

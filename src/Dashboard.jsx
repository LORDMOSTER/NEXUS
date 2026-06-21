import React, { useEffect, useState } from 'react';
import { LogOut, Sun, Moon } from 'lucide-react';
import useAuthStore from './store/useAuthStore';
import CreateAssessment from './CreateAssessment';
import Archives from './pages/Archives';
import Settings from './pages/Settings';
import Particles from './components/Particles';
import ShinyText from './components/ShinyText';
import RotatingText from './components/RotatingText';
import './Dashboard.css';

/* ─── Dashboard ──────────────────────────────────────────────── */
function Dashboard() {
  const { user, logout, theme, toggleTheme, fetchExams, exams, isFetchingExams } = useAuthStore();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDarkMode = theme === 'dark';

  const sideLinks = ['Dashboard', 'Create Assessment', 'Archives', 'Settings'];

  useEffect(() => { fetchExams(); }, [fetchExams]);

  return (
    <div className="flex min-h-screen relative z-0 overflow-x-hidden font-sans" style={{ background: 'var(--app-bg)' }}>
      
      {/* LIVE BACKGROUND (Only visible in Dark Mode) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none transition-opacity duration-500" style={{ opacity: isDarkMode ? 1 : 0 }}>
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={30}
          speed={0}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      {/* FLOATING CONTROLS */}
      {/* 1. Menu Toggle (Top Left) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-8 z-[60] soft-button w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isSidebarOpen ? 'left-[260px]' : 'left-8'
        }`}
        style={{ color: 'var(--accent)' }}
        aria-label="Toggle Navigation"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSidebarOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>

      {/* 2. Theme Toggle (Top Right) */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-8 z-[60] soft-button w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{ color: 'var(--accent)' }}
        aria-label="Toggle Theme"
      >
        {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* COLLAPSIBLE LEFT SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 soft-surface rounded-none rounded-r-[40px] z-50 flex flex-col py-10 px-8 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Premium ShinyText Logo */}
        <div className="mb-12 mt-6 px-2">
          <ShinyText
            text="NexusOBE"
            speed={4}
            className="text-3xl font-extrabold tracking-tighter"
            color="var(--text-main)"
            shineColor="var(--accent)"
          />
          <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Assessment Platform</p>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          {sideLinks.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActiveNav(link);
                setIsSidebarOpen(false);
              }}
              className={`text-left px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 relative ${
                activeNav === link
                  ? 'soft-inset font-bold translate-x-1'
                  : 'hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={{ color: activeNav === link ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {activeNav === link && (
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3/5 rounded-r-full"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' }}
                />
              )}
              {link}
            </button>
          ))}
        </nav>

        <div
          onClick={logout}
          className="mt-auto flex items-center gap-3 cursor-pointer transition-colors font-semibold px-5 py-3 hover:text-red-500"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={20} />
          Logout
        </div>
      </aside>

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 w-full min-h-screen pt-24 px-8 pb-12 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto w-full">

          {isFetchingExams ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div
                className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--border-rim)', borderTopColor: 'var(--accent)' }}
              />
            </div>

          ) : activeNav === 'Create Assessment' ? (
            <CreateAssessment />

          ) : activeNav === 'Dashboard' ? (
            <div className="flex flex-col gap-10">

              {/* ── KINETIC HEADER ──────────────────────────────── */}
              <div className="mb-2 mt-4 flex flex-col gap-3">
                <ShinyText
                  text={`Welcome back, ${user?.name ? (user.name.split(' ')[1] || user.name) : 'Dr. Chandrasekar'}`}
                  speed={3}
                  className="text-5xl md:text-6xl font-extrabold tracking-tight"
                  color="var(--text-main)"
                  shineColor="var(--accent)"
                />
                <div className="flex items-center gap-3 font-medium text-lg" style={{ color: 'var(--text-muted)' }}>
                  <span>Seamlessly generate</span>
                  <RotatingText
                    texts={['Assessments', 'Blueprints', 'Curriculums', 'Question Banks']}
                    mainClassName="px-3 py-1 rounded-md shadow-sm font-bold tracking-wide bg-[var(--accent)] text-white"
                    staggerFrom="last"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-120%', opacity: 0 }}
                    staggerDuration={0.02}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    rotationInterval={3000}
                  />
                </div>
              </div>

              {/* ── SECTION LABEL ────────────────────────────────── */}
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}
                >
                  Your Exam Records
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {exams.length} record{exams.length !== 1 ? 's' : ''} for {user?.departmentCode}
                </p>
              </div>

              {/* ── TRUE BENTO GRID ──────────────────────────────── */}
              {exams.length === 0 ? (
                <div className="soft-surface rounded-[32px] p-12 text-center">
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-muted)' }}>
                    No exams found.
                  </p>
                  <button
                    onClick={() => setActiveNav('Create Assessment')}
                    className="mt-4 soft-button rounded-full px-6 py-2 font-bold"
                    style={{ color: 'var(--accent)' }}
                  >
                    Create your first assessment
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[220px] gap-6">
                  {exams.map((exam, index) => {
                    // Every 1st and 4th card (0-indexed: 0, 3, 6...) spans 2 columns
                    const isWide = index % 3 === 0;

                    return (
                      <div
                        key={exam._id || index}
                        className={`soft-surface p-8 rounded-[32px] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-2 group ${isWide ? 'md:col-span-2' : 'md:col-span-1'}`}
                        style={{ '--hover-shadow': '0 20px 40px rgba(0,0,0,0.3)' }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
                      >
                        {/* Top Row */}
                        <div className="flex justify-between items-start">
                          <span
                            className="soft-inset px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-inner"
                            style={{ color: 'var(--accent)' }}
                          >
                            {exam.status === 'Locked' ? 'LOCKED' : 'DRAFT'}
                          </span>
                          <svg
                            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                            style={{ color: 'var(--text-muted)' }}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>

                        {/* Bottom Content */}
                        <div>
                          <p
                            className="text-xs font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'var(--accent)' }}
                          >
                            {exam.subjectCode}
                          </p>
                          <h2
                            className="text-2xl font-bold leading-tight mb-2 transition-colors duration-200 group-hover:text-[var(--accent)]"
                            style={{ color: 'var(--text-main)' }}
                          >
                            {exam.subjectName}
                          </h2>
                          <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                            {exam.examType} · Units: {(exam.unitsIncluded || []).join(', ')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          ) : activeNav === 'Archives' ? (
            <Archives />
          ) : activeNav === 'Settings' ? (
            <Settings />
          ) : (
            <div className="soft-surface rounded-[32px] p-12 flex flex-col items-center justify-center min-h-[50vh] opacity-60">
              <h2 className="text-2xl font-bold mb-2 text-[var(--text-main)]">{activeNav}</h2>
              <p style={{ color: 'var(--text-muted)' }}>This section is under construction.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default Dashboard;

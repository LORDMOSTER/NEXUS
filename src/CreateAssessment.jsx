import React, { useState, useEffect } from 'react';
import useAssessmentStore from './store/useAssessmentStore';
import { useScrollReveal } from './hooks/useScrollReveal';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap } from 'lucide-react';

const standardExamOptions = ['CAT-1', 'CAT-2', 'End Semester'];

/* ─── Toggle pill button ─────────────────────────────────────── */
const PillBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={
      active
        ? 'soft-inset flex-1 py-3 px-4 text-sm font-bold rounded-xl'
        : 'soft-button flex-1 py-3 px-4 text-sm font-medium rounded-xl'
    }
    style={
      active 
        ? { color: 'var(--accent)', backgroundColor: 'var(--accent-glow)' }
        : {}
    }
  >
    {children}
  </button>
);

/* ─── Section header label ───────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <h3
    className="text-xs font-bold uppercase tracking-widest mb-2"
    style={{ color: 'var(--text-muted)' }}
  >
    {children}
  </h3>
);

function CreateAssessment() {
  const {
    examType,
    setExamType,
    selectedSubject,
    setSelectedSubject,
    examPattern,
    setExamPattern,
    headerData,
    setHeaderData,
    department,
    setDepartment,
    academicYear,
    setAcademicYear,
    yearSem,
    setYearSem,
    qpCode,
    setQpCode,
    extraInstructions,
    setExtraInstructions,
    quizUnits,
    toggleQuizUnit,
    quizQuestionCount,
    setQuizQuestionCount,
    setAssessmentData,
  } = useAssessmentStore();
  const revealRef = useScrollReveal();
  const navigate = useNavigate();

  useEffect(() => {
    if (examType === 'CAT-1' || examType === 'CAT-2') {
      setExamPattern('16-mark pattern');
    } else if (examType === 'End Semester') {
      setExamPattern('16-mark pattern');
    } else {
      setExamPattern('Freestyle');
    }
  }, [examType, setExamPattern]);

  const [searchTerm, setSearchTerm] = useState(
    selectedSubject ? `${selectedSubject.subjectCode} - ${selectedSubject.subjectName}` : ''
  );
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (
        searchTerm &&
        (!selectedSubject || searchTerm !== `${selectedSubject.subjectCode} - ${selectedSubject.subjectName}`)
      ) {
        setIsSearching(true);
        try {
          const res = await api.get(`/subjects/search?q=${encodeURIComponent(searchTerm)}`);
          setSearchResults(res.data);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error fetching subjects', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedSubject]);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSearchTerm(`${subject.subjectCode} - ${subject.subjectName}`);
    setShowDropdown(false);
  };

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Stepper logic
  const stepDone1 = examType && (examType !== 'Freestyle Quiz' ? (academicYear && yearSem && department) : true);
  const stepDone2 = !!selectedSubject;
  const stepDone3 = stepDone2 && (examType === 'Freestyle Quiz' ? quizUnits.length > 0 : !!headerData?.examDate);
  const steps = [
    { label: 'Exam Context', done: !!stepDone1 },
    { label: 'Blueprint', done: !!stepDone2 },
    { label: 'Review', done: !!stepDone3 },
  ];
  const currentStep = stepDone3 ? 2 : stepDone2 ? 1 : 0;

  return (
    <div ref={revealRef} className="max-w-4xl mx-auto w-full pb-12 mt-4">
      {/* ── Page Header ──────────────────────────────────────── */}
      <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--text-main)' }}>Create Assessment</h1>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Define the parameters and blueprint directives for the new examination.</p>

      {/* ── Progress Stepper ─────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
                style={{
                  background: step.done ? 'var(--accent)' : idx === currentStep ? 'var(--accent-glow)' : 'var(--surface-inset)',
                  color: step.done ? '#fff' : idx === currentStep ? 'var(--accent)' : 'var(--text-muted)',
                  border: idx === currentStep && !step.done ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {step.done ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : (idx + 1)}
              </div>
              <span className="text-xs font-semibold hidden sm:block transition-colors"
                style={{ color: step.done || idx === currentStep ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 rounded-full transition-all duration-500"
                style={{ background: step.done ? 'var(--accent)' : 'var(--border-subtle)' }} />
            )}
          </React.Fragment>
        ))}
      </div>



      {/* ── CARD 1: Exam Context ──────────────────────────────── */}
      <div className="soft-surface p-8 rounded-3xl mb-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-[var(--text-main)] border-b pb-3 mb-2" style={{ borderColor: 'var(--border-rim)' }}>
          Exam Context
        </h2>

        {examType !== 'Freestyle Quiz' && (
          <div>
            <SectionLabel>Assessment Type</SectionLabel>
            <div className="flex flex-wrap gap-3">
              {standardExamOptions.map((option) => (
                <PillBtn key={option} active={examType === option} onClick={() => setExamType(option)}>
                  {option}
                </PillBtn>
              ))}
            </div>
          </div>
        )}

        {examType !== 'Freestyle Quiz' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <SectionLabel>Academic Year</SectionLabel>
              <input
                type="text"
                placeholder="e.g., 2025-2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="soft-inset w-full px-4 py-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <SectionLabel>Year / Sem</SectionLabel>
              <input
                type="text"
                placeholder="e.g., III / V"
                value={yearSem}
                onChange={(e) => setYearSem(e.target.value)}
                className="soft-inset w-full px-4 py-3 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <SectionLabel>Departments</SectionLabel>
              <div className="flex flex-wrap gap-3 mt-1">
                {['CSE', 'IT', 'ECE', 'EEE', 'AIDS'].map((dept) => {
                  const isSelected = department && department.split(' / ').includes(dept);
                  return (
                    <PillBtn
                      key={dept}
                      active={isSelected}
                      onClick={() => {
                        let currentDepts = department
                          ? department.split(' / ').filter((d) => d.trim() !== '')
                          : [];
                        if (currentDepts.includes(dept)) {
                          currentDepts = currentDepts.filter((d) => d !== dept);
                        } else {
                          currentDepts.push(dept);
                        }
                        setDepartment(currentDepts.join(' / '));
                      }}
                    >
                      {dept}
                    </PillBtn>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CARD 2: Blueprint Directives ──────────────────────── */}
      <div className="soft-surface p-8 rounded-3xl mb-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-[var(--text-main)] border-b pb-3 mb-2" style={{ borderColor: 'var(--border-rim)' }}>
          Blueprint Directives
        </h2>

        {/* Subject Selection */}
        <div>
          <SectionLabel>Subject Selection</SectionLabel>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Subject Code or Name (e.g., CS33)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedSubject) setSelectedSubject(null);
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              className="soft-inset w-full px-4 py-3 text-sm"
            />
            {isSearching && (
              <div
                className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--accent)' }}
              ></div>
            )}
            {showDropdown && searchResults.length > 0 && (
              <ul
                data-lenis-prevent="true"
                className="absolute left-0 right-0 top-[calc(100%+6px)] rounded-xl py-1 z-50 max-h-56 overflow-y-auto soft-surface"
              >
                {searchResults.map((subject) => (
                  <li
                    key={subject._id}
                    onClick={() => handleSelectSubject(subject)}
                    className="px-4 py-3 cursor-pointer text-sm transition-colors border-b last:border-none"
                    style={{ borderColor: 'var(--border-rim)', color: 'var(--text-main)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent)';
                      e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-main)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span className="font-bold mr-2">{subject.subjectCode}</span>
                    {subject.subjectName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {examType === 'Freestyle Quiz' ? (
          <div className={`flex flex-col gap-6 ${!selectedSubject ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <SectionLabel>Target Units</SectionLabel>
              <div className="flex flex-wrap gap-3">
                {['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'].map((unit) => (
                  <PillBtn key={unit} active={quizUnits.includes(unit)} onClick={() => toggleQuizUnit(unit)}>
                    {unit}
                  </PillBtn>
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>Number of Questions</SectionLabel>
              <input
                type="number"
                min="1"
                max="50"
                value={quizQuestionCount}
                onChange={(e) => setQuizQuestionCount(e.target.value)}
                className="soft-inset w-full md:w-1/3 px-4 py-3 text-sm"
              />
            </div>
          </div>
        ) : (
          <div className={`flex flex-col gap-6 ${!selectedSubject ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <SectionLabel>Exam Pattern</SectionLabel>
              {['CAT-1', 'CAT-2', 'End Semester'].includes(examType) ? (
                <div className="flex flex-col md:flex-row gap-3">
                  {['16-mark pattern', '13-mark Either/Or pattern'].map((pattern) => (
                    <PillBtn key={pattern} active={examPattern === pattern} onClick={() => setExamPattern(pattern)}>
                      {pattern}
                    </PillBtn>
                  ))}
                </div>
              ) : (
                <div
                  className="w-full p-4 rounded-xl text-sm soft-inset"
                >
                  <span className="font-bold text-[var(--text-main)]">Locked Pattern:</span>
                  <span className="ml-2 font-semibold text-[var(--accent)]">{examPattern}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <SectionLabel>Exam Date</SectionLabel>
                <input
                  type="date"
                  min={minDate}
                  value={headerData.examDate}
                  onChange={(e) => setHeaderData('examDate', e.target.value)}
                  className="soft-inset w-full px-4 py-3 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <SectionLabel>QP Code</SectionLabel>
                <input
                  type="text"
                  maxLength="5"
                  value={qpCode}
                  onChange={(e) => setQpCode(e.target.value)}
                  className="soft-inset w-full px-4 py-3 text-sm uppercase"
                />
              </div>
              <div className="flex flex-col gap-2">
                <SectionLabel>Max Marks</SectionLabel>
                <div className="relative">
                  <input
                    type="number"
                    value={headerData.maxMarks}
                    readOnly
                    className="soft-inset w-full px-4 py-3 text-sm opacity-50 cursor-not-allowed pr-8"
                  />
                  <svg className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <SectionLabel>Duration</SectionLabel>
                <div className="relative">
                  <input
                    type="text"
                    value={headerData.duration}
                    readOnly
                    className="soft-inset w-full px-4 py-3 text-sm opacity-50 cursor-not-allowed pr-8"
                  />
                  <svg className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>Additional Instructions</SectionLabel>
              <textarea
                placeholder="Extra comments for the students..."
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                rows="3"
                className="soft-inset w-full px-4 py-3 text-sm resize-none"
              ></textarea>
            </div>
          </div>
        )}
      </div>

      {/* ── Generate Button ───────────────────────────────────── */}
      <div className={!selectedSubject ? 'opacity-40 pointer-events-none' : ''}>
        {examType === 'Freestyle Quiz' ? (
          <button
            onClick={() => {
              setAssessmentData({
                subjectCode: selectedSubject?.subjectCode || "QUIZ",
                subjectName: selectedSubject?.subjectName || "Custom Topic",
                examType: 'Freestyle Quiz',
                targetUnits: quizUnits,
                numberOfQuestions: quizQuestionCount
              });
              navigate('/studio');
            }}
            className="w-full px-8 py-4 bg-[var(--accent)] text-[#fff] font-bold rounded-xl shadow-lg hover:brightness-110 transition-all flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Initialize Quiz Studio
          </button>
        ) : (
          <button
            onClick={() => navigate('/studio')}
            className="w-full py-4 rounded-xl font-bold text-lg soft-surface soft-surface-hover text-[var(--accent)] transition-all"
          >
            Generate Assessment
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateAssessment;

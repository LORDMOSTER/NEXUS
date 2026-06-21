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

  return (
    <div ref={revealRef} className="max-w-4xl mx-auto w-full pb-12 mt-4">
      {/* ── Page Header ──────────────────────────────────────── */}
      <h1 className="text-3xl font-bold mb-2 tracking-tight text-[var(--text-main)]">
        Create Assessment
      </h1>
      <p className="text-[var(--text-muted)] mb-8">
        Define the parameters and blueprint directives for the new examination.
      </p>

      {/* ── Tab System ─────────────────────────────────────────── */}
      <div className="relative flex border-b mb-8" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => {
            if (examType === 'Freestyle Quiz') setExamType('CAT-1');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors duration-200 ${
            examType !== 'Freestyle Quiz'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border-b-2 border-transparent'
          }`}
        >
          <BookOpen size={16} />
          Standard Exam
        </button>
        <button
          onClick={() => setExamType('Freestyle Quiz')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors duration-200 ${
            examType === 'Freestyle Quiz'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border-b-2 border-transparent'
          }`}
        >
          <Zap size={16} />
          Freestyle Quiz
        </button>
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
                <input
                  type="number"
                  value={headerData.maxMarks}
                  readOnly
                  className="soft-inset w-full px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <SectionLabel>Duration</SectionLabel>
                <input
                  type="text"
                  value={headerData.duration}
                  readOnly
                  className="soft-inset w-full px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                />
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
        <button
          onClick={() => navigate('/studio')}
          className="w-full py-4 rounded-xl font-bold text-lg soft-surface soft-surface-hover text-[var(--accent)] transition-all"
        >
          Generate Assessment
        </button>
      </div>
    </div>
  );
}

export default CreateAssessment;

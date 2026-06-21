import { create } from 'zustand';

const useAssessmentStore = create((set) => ({
  examType: 'CAT-1', // Default option
  selectedSubject: null,
  examPattern: '',
  headerData: {
    examDate: '',
    maxMarks: '100',
    duration: '3 Hours',
  },
  department: 'CSE',
  academicYear: '',
  yearSem: '',
  qpCode: '',
  extraInstructions: '',
  quizUnits: [],
  quizQuestionCount: 20,

  setExamType: (type) => set({ examType: type }),
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  setExamPattern: (pattern) => set({ examPattern: pattern }),
  setHeaderData: (key, value) => set((state) => ({
    headerData: { ...state.headerData, [key]: value }
  })),
  setDepartment: (dept) => set({ department: dept }),
  setAcademicYear: (year) => set({ academicYear: year }),
  setYearSem: (sem) => set({ yearSem: sem }),
  setQpCode: (code) => set({ qpCode: code }),
  setExtraInstructions: (instructions) => set({ extraInstructions: instructions }),
  toggleQuizUnit: (unit) => set((state) => ({
    quizUnits: state.quizUnits.includes(unit) 
      ? state.quizUnits.filter(u => u !== unit) 
      : [...state.quizUnits, unit]
  })),
  setQuizQuestionCount: (count) => set({ quizQuestionCount: count }),
  
  resetAssessment: () => set({
    examType: 'CAT-1',
    selectedSubject: null,
    examPattern: '',
    headerData: { examDate: '', maxMarks: '100', duration: '3 Hours' },
    department: 'CSE',
    academicYear: '',
    yearSem: '',
    qpCode: '',
    extraInstructions: '',
    quizUnits: [],
    quizQuestionCount: 20
  })
}));

export default useAssessmentStore;

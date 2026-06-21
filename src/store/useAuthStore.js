import { create } from 'zustand';
import api from '../api';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialTheme = getInitialTheme();
if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  theme: initialTheme,
  exams: [],
  isFetchingExams: false,

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    set({ theme: newTheme });
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  fetchExams: async () => {
    set({ isFetchingExams: true, error: null });
    try {
      // Fetch both the seeded exams and the live locked ExamRecords in parallel
      const [examsResponse, archivesResponse] = await Promise.allSettled([
        api.get('/exams'),
        api.get('/export/archives'),
      ]);

      const seededExams = examsResponse.status === 'fulfilled' ? examsResponse.value.data : [];

      // Map the DB ExamRecord schema to match the Dashboard card structure
      let liveExams = [];
      if (archivesResponse.status === 'fulfilled' && archivesResponse.value.data.success) {
        liveExams = archivesResponse.value.data.records.map(r => ({
          _id: r._id,
          subjectCode: r.code,
          subjectName: r.name,
          examType: r.type,
          unitsIncluded: [],
          status: 'Locked',
          _isLive: true, // flag to distinguish from seeded cards
        }));
      }

      // Live records first, seeded records after
      set({ exams: [...liveExams, ...seededExams], isFetchingExams: false });
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      set({ error: 'Failed to load exams', isFetchingExams: false });
    }
  },

  login: async (structuredId, passcode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { structuredId, passcode });
      const { token, user } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update Zustand state
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Handle error gracefully
      const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      // Clear anything from local storage just in case
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));

export default useAuthStore;

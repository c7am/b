import { create } from 'zustand';

export const useShiftStore = create((set) => ({
  shifts: [],
  currentShift: null,
  isLoading: false,
  error: null,
  timer: 0,
  timerInterval: null,

  // Fetch all shifts for current user
  fetchShifts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shifts`);
      if (!res.ok) throw new Error('Failed to fetch shifts');
      const shifts = await res.json();
      set({ shifts, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Start a new shift
  startShift: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shifts/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to start shift');
      const shift = await res.json();
      set((state) => ({
        currentShift: shift,
        timer: 0,
        isLoading: false,
        shifts: [shift, ...state.shifts],
      }));
      // Start timer
      useShiftStore.getState().startTimer();
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Pause current shift
  pauseShift: async () => {
    const { currentShift } = useShiftStore.getState();
    if (!currentShift) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shifts/${currentShift.id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to pause shift');
      const updated = await res.json();
      set({ currentShift: updated, isLoading: false });
      useShiftStore.getState().stopTimer();
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // End current shift
  endShift: async () => {
    const { currentShift } = useShiftStore.getState();
    if (!currentShift) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shifts/${currentShift.id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to end shift');
      const updated = await res.json();
      set({ currentShift: null, isLoading: false });
      useShiftStore.getState().stopTimer();
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  // Start client-side timer
  startTimer: () => {
    const interval = setInterval(() => {
      set((state) => ({ timer: state.timer + 1 }));
    }, 1000);
    set({ timerInterval: interval });
  },

  // Stop client-side timer
  stopTimer: () => {
    const { timerInterval } = useShiftStore.getState();
    if (timerInterval) clearInterval(timerInterval);
    set({ timerInterval: null });
  },

  // Format timer as HH:MM:SS
  formatTimer: () => {
    const { timer } = useShiftStore.getState();
    const hours = Math.floor(timer / 3600);
    const minutes = Math.floor((timer % 3600) / 60);
    const seconds = timer % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  },
}));

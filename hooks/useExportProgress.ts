import { create } from "zustand";

export const useExportProgress = create<{
  active: boolean;
  progress: number;
  start: () => void;
  set: (v: number) => void;
  done: () => void;
}>((set) => ({
  active: false,
  progress: 0,
  start: () => set({ active: true, progress: 0 }),
  set: (v) => set({ progress: v }),
  done: () => set({ active: false, progress: 100 }),
}));

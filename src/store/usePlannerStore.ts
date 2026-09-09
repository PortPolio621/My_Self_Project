import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { BossEntry, Goal, PlannerState } from "@/types";

interface PlannerActions {
  setCurrentMeso: (amount: number) => void;
  setDailyFarmingIncome: (amount: number) => void;
  addBossEntry: (entry: Omit<BossEntry, "id">) => void;
  updateBossEntry: (id: string, patch: Partial<Omit<BossEntry, "id">>) => void;
  removeBossEntry: (id: string) => void;
  toggleBossCleared: (id: string) => void;
  resetWeeklyBossClears: () => void;
  setGoal: (goal: Goal | null) => void;
}

const initialState: PlannerState = {
  currentMeso: 0,
  dailyFarmingIncome: 0,
  bossEntries: [],
  goal: null,
};

export const usePlannerStore = create<PlannerState & PlannerActions>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentMeso: (amount) => set({ currentMeso: Math.max(amount, 0) }),

      setDailyFarmingIncome: (amount) =>
        set({ dailyFarmingIncome: Math.max(amount, 0) }),

      addBossEntry: (entry) =>
        set((state) => ({
          bossEntries: [
            ...state.bossEntries,
            { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
          ],
        })),

      updateBossEntry: (id, patch) =>
        set((state) => ({
          bossEntries: state.bossEntries.map((entry) =>
            entry.id === id ? { ...entry, ...patch } : entry
          ),
        })),

      removeBossEntry: (id) =>
        set((state) => ({
          bossEntries: state.bossEntries.filter((entry) => entry.id !== id),
        })),

      toggleBossCleared: (id) =>
        set((state) => ({
          bossEntries: state.bossEntries.map((entry) =>
            entry.id === id ? { ...entry, cleared: !entry.cleared } : entry
          ),
        })),

      resetWeeklyBossClears: () =>
        set((state) => ({
          bossEntries: state.bossEntries.map((entry) => ({ ...entry, cleared: false })),
        })),

      setGoal: (goal) => set({ goal }),
    }),
    {
      name: "meso-planner-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

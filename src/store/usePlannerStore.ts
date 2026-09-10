import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { HUNTING_KILL_COUNT_MIN, getLocalDateKey } from "@/utils/meso";
import { Goal, PlannerState } from "@/types";

interface PlannerActions {
  setCurrentMeso: (amount: number) => void;
  setHuntingKillCount: (count: number) => void;
  setHuntingMinutes: (minutes: number) => void;
  setMesoGainPercent: (percent: number) => void;
  toggleElixirOfWealth: () => void;
  toggleUnionWealth: () => void;
  setSolErdaPrice: (price: number) => void;
  setSolErdaCount: (count: number) => void;
  setWeeklyBossIncome: (amount: number) => void;
  confirmDailyHuntingIncome: (totalMeso: number) => void;
  setGoal: (goal: Goal | null) => void;
}

const initialState: PlannerState = {
  currentMeso: 0,
  huntingKillCount: HUNTING_KILL_COUNT_MIN,
  huntingMinutes: 0,
  mesoGainPercent: 0,
  useElixirOfWealth: false,
  useUnionWealth: false,
  solErdaPrice: 0,
  solErdaCount: 0,
  weeklyBossIncome: 0,
  huntingLog: [],
  huntingConfirmCount: 0,
  goal: null,
};

export const usePlannerStore = create<PlannerState & PlannerActions>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentMeso: (amount) => set({ currentMeso: Math.max(amount, 0) }),

      setHuntingKillCount: (count) => set({ huntingKillCount: count }),

      setHuntingMinutes: (minutes) => set({ huntingMinutes: Math.max(minutes, 0) }),

      setMesoGainPercent: (percent) =>
        set({ mesoGainPercent: Math.max(percent, 0) }),

      toggleElixirOfWealth: () =>
        set((state) => ({ useElixirOfWealth: !state.useElixirOfWealth })),

      toggleUnionWealth: () =>
        set((state) => ({ useUnionWealth: !state.useUnionWealth })),

      setSolErdaPrice: (price) => set({ solErdaPrice: Math.max(price, 0) }),

      setSolErdaCount: (count) => set({ solErdaCount: Math.max(count, 0) }),

      setWeeklyBossIncome: (amount) =>
        set({ weeklyBossIncome: Math.max(amount, 0) }),

      confirmDailyHuntingIncome: (totalMeso) =>
        set((state) => {
          const todayKey = getLocalDateKey();
          const existingIndex = state.huntingLog.findIndex(
            (entry) => entry.date === todayKey
          );

          const huntingLog =
            existingIndex >= 0
              ? state.huntingLog.map((entry, i) =>
                  i === existingIndex
                    ? { ...entry, totalMeso: entry.totalMeso + totalMeso }
                    : entry
                )
              : [
                  ...state.huntingLog,
                  {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    date: todayKey,
                    totalMeso,
                  },
                ];

          return {
            huntingLog,
            huntingConfirmCount: state.huntingConfirmCount + 1,
          };
        }),

      setGoal: (goal) => set({ goal }),
    }),
    {
      name: "meso-planner-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

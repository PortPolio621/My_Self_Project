import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { HUNTING_KILL_COUNT_MIN } from "@/utils/meso";
import { Goal, PlannerState } from "@/types";

interface PlannerActions {
  setCurrentMeso: (amount: number) => void;
  setHuntingKillCount: (count: number) => void;
  setHuntingMinutesPerDay: (minutes: number) => void;
  setSolErdaPrice: (price: number) => void;
  setSolErdaCount: (count: number) => void;
  setWeeklyBossIncome: (amount: number) => void;
  setGoal: (goal: Goal | null) => void;
}

const initialState: PlannerState = {
  currentMeso: 0,
  huntingKillCount: HUNTING_KILL_COUNT_MIN,
  huntingMinutesPerDay: 0,
  solErdaPrice: 0,
  solErdaCount: 0,
  weeklyBossIncome: 0,
  goal: null,
};

export const usePlannerStore = create<PlannerState & PlannerActions>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentMeso: (amount) => set({ currentMeso: Math.max(amount, 0) }),

      setHuntingKillCount: (count) => set({ huntingKillCount: count }),

      setHuntingMinutesPerDay: (minutes) =>
        set({ huntingMinutesPerDay: Math.max(minutes, 0) }),

      setSolErdaPrice: (price) => set({ solErdaPrice: Math.max(price, 0) }),

      setSolErdaCount: (count) => set({ solErdaCount: Math.max(count, 0) }),

      setWeeklyBossIncome: (amount) =>
        set({ weeklyBossIncome: Math.max(amount, 0) }),

      setGoal: (goal) => set({ goal }),
    }),
    {
      name: "meso-planner-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

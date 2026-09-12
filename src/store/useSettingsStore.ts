import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * 로그인 유지 시간.
 * "none": 앱을 껐다 켤 때마다 매번 새로 로그인해야 함 (세션 저장 안 함)
 * "3h" / "6h": 마지막 로그인 후 그 시간이 지나면 다음 실행 때 자동 로그아웃
 * "forever": 직접 로그아웃을 누르기 전까지 계속 로그인 상태 유지 (기본값)
 */
export type SessionDuration = "none" | "3h" | "6h" | "forever";

export const SESSION_DURATION_LABELS: Record<SessionDuration, string> = {
  none: "없음 (즉시 로그아웃)",
  "3h": "3시간",
  "6h": "6시간",
  forever: "영구",
};

interface SettingsState {
  sessionDuration: SessionDuration;
  setSessionDuration: (duration: SessionDuration) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sessionDuration: "forever",
      setSessionDuration: (sessionDuration) => set({ sessionDuration }),
    }),
    {
      name: "meso-planner-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { create } from "zustand";

import { auth } from "@/services/firebase";
import { SessionDuration, useSettingsStore } from "@/store/useSettingsStore";

interface AuthState {
  user: User | null;
  /** Firebase가 로그인 상태를 아직 확인하지 못한 최초 순간 */
  initializing: boolean;
  /** 이메일 인증 등 서버에서 바뀐 사용자 정보를 다시 불러온다 */
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  refreshUser: async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    set({ user: auth.currentUser });
  },
}));

const SESSION_DURATION_MS: Partial<Record<SessionDuration, number>> = {
  none: 0,
  "3h": 3 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
};

/**
 * 설정에서 고른 "로그인 유지 시간"을 앱을 새로 열었을 때(=최초 인증 상태 확인 시)만 검사한다.
 * 로그인 직후 계속 쓰는 중에는 재검사하지 않고, 다음에 앱을 껐다 켰을 때 다시 확인한다.
 */
let hasCheckedSessionDuration = false;

onAuthStateChanged(auth, (user) => {
  if (user && !hasCheckedSessionDuration) {
    const { sessionDuration } = useSettingsStore.getState();
    if (sessionDuration !== "forever") {
      const lastSignInMs = user.metadata.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).getTime()
        : 0;
      const limitMs = SESSION_DURATION_MS[sessionDuration] ?? 0;
      if (Date.now() - lastSignInMs > limitMs) {
        hasCheckedSessionDuration = true;
        signOut(auth);
        return;
      }
    }
  }
  hasCheckedSessionDuration = true;
  useAuthStore.setState({ user, initializing: false });
});

import { User, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";

import { auth } from "@/services/firebase";

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

onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, initializing: false });
});

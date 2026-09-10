import { User, onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";

import { auth } from "@/services/firebase";

interface AuthState {
  user: User | null;
  /** Firebase가 로그인 상태를 아직 확인하지 못한 최초 순간 */
  initializing: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  initializing: true,
}));

onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, initializing: false });
});

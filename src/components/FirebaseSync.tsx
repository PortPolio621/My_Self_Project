import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useRef } from "react";

import { db } from "@/services/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlannerStore } from "@/store/usePlannerStore";
import { PlannerState } from "@/types";

/** Firestore에 올리고 내려받을 실제 데이터 필드 (스토어의 액션 함수는 제외) */
const SYNCED_KEYS = [
  "currentMeso",
  "huntingKillCount",
  "huntingMinutes",
  "mesoGainPercent",
  "useElixirOfWealth",
  "useUnionWealth",
  "solErdaPrice",
  "solErdaCount",
  "weeklyBossIncome",
  "huntingLog",
  "huntingConfirmCount",
  "goal",
] as const satisfies readonly (keyof PlannerState)[];

type SyncedData = Pick<PlannerState, (typeof SYNCED_KEYS)[number]>;

function extractSyncedData(state: PlannerState): SyncedData {
  const data = {} as SyncedData;
  for (const key of SYNCED_KEYS) {
    (data as Record<string, unknown>)[key] = state[key];
  }
  return data;
}

/**
 * 로그인 상태면 플래너 데이터를 Firestore(`planners/{uid}`)와 동기화한다.
 * 로그인 시 클라우드에 기존 기록이 있으면 그걸로 덮어쓰고, 없으면(최초 로그인)
 * 지금 기기에 있던 데이터를 그대로 클라우드에 올린다. 화면에는 아무것도 그리지 않는다.
 */
export function FirebaseSync() {
  const user = useAuthStore((s) => s.user);
  const loadedForUid = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      loadedForUid.current = null;
      return;
    }
    if (loadedForUid.current === user.uid) return;

    let cancelled = false;

    (async () => {
      try {
        const ref = doc(db, "planners", user.uid);
        const snapshot = await getDoc(ref);
        if (cancelled) return;

        if (snapshot.exists()) {
          usePlannerStore.setState(snapshot.data() as Partial<SyncedData>);
        } else {
          await setDoc(ref, extractSyncedData(usePlannerStore.getState()));
        }
        loadedForUid.current = user.uid;
      } catch (error) {
        // Firestore 권한/네트워크 문제로 실패해도 앱은 로컬 데이터로 계속 동작한다.
        // loadedForUid를 갱신하지 않으므로 다음 인증 상태 변화 때 다시 시도된다.
        console.warn("FirebaseSync: failed to load cloud data", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = usePlannerStore.subscribe((state) => {
      if (loadedForUid.current !== user.uid) return;

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setDoc(doc(db, "planners", user.uid), extractSyncedData(state)).catch((error) => {
          // 오프라인/권한 문제 등으로 저장 실패 시 다음 상태 변경에서 다시 시도된다
          console.warn("FirebaseSync: failed to save cloud data", error);
        });
      }, 800);
    });

    return () => {
      unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [user]);

  return null;
}

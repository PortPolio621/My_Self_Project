import type { Persistence } from "@firebase/auth";

/**
 * `@firebase/auth`의 공개 타입 정의(auth-public.d.ts)는 여러 플랫폼 공용본이라
 * React Native 전용 빌드(dist/rn)에만 있는 getReactNativePersistence를 담고 있지
 * 않다. 런타임에는 실제로 존재하는 함수라 타입만 보강해준다.
 */
declare module "@firebase/auth" {
  export function getReactNativePersistence(storage: unknown): Persistence;
}

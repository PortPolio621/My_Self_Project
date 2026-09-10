import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
// firebase 패키지의 "firebase/auth" 서브패스는 React Native 조건부 빌드를
// 내보내지 않아 getReactNativePersistence가 없다. 실제로 그 함수를 담고
// 있는 하위 패키지에서 직접 가져온다.
import { getReactNativePersistence, initializeAuth } from "@firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAGbYfVCMp5aVR4y2yuhiENhyH71KndCMU",
  authDomain: "meso-planner.firebaseapp.com",
  projectId: "meso-planner",
  storageBucket: "meso-planner.firebasestorage.app",
  messagingSenderId: "446455492456",
  appId: "1:446455492456:web:172d9055a016cddd9b30dd",
  measurementId: "G-WCGSKJX9YY",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * 웹은 브라우저 기본 영속성(getAuth)을 쓰고, 네이티브는 AsyncStorage 기반
 * 영속성을 명시해야 앱을 껐다 켜도 로그인이 유지된다.
 */
function createAuth(): Auth {
  if (Platform.OS === "web") {
    return getAuth(firebaseApp);
  }
  return initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = createAuth();
export const db = getFirestore(firebaseApp);

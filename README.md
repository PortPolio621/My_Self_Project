# 메소 플래너

메이플스토리 메소(재화) 관리용 앱. 사냥 수입과 주간 보스 수입을 등록하면 현재 보유
메소를 기준으로 목표 아이템을 구매하기까지 걸리는 예상 기간을 계산해줍니다. 이메일
계정으로 로그인하면 웹/모바일 어디서든 같은 데이터를 볼 수 있어요.

- **웹 데모**: https://meso-planner.web.app
- **개인정보처리방침**: https://claude.ai/artifact/7dEdsyGn2fah5qHJeusDF4

## 주요 기능

- **계정 동기화**: Firebase Authentication(이메일/비밀번호) 로그인 + Firestore
  실시간 동기화로 웹/안드로이드 어디서든 같은 데이터 사용
- **수입 계산**: 사냥 마릿수·시간·메소 획득량(재물 획득의 비약, 유니온의 부 포함)으로
  분당/하루 사냥 수입 자동 계산
- **솔 에르다 조각 판매**: 경매장 수수료(MVP 등급 여부에 따라 5%/3%) 자동 반영
- **가계부**: 날짜별 사냥 수입 기록, 무료 플랜은 최근 7일 평균만 반영(기록은 무제한
  보관), 프로 플랜은 전체 기간 평균 + 누적 통계 제공
- **목표 아이템**: 이름/가격 입력 시 현재 수입 기준 예상 달성 기간 실시간 계산
- **주간 보스**: 이번 주 보스 총수익 입력
- **설정**: 테마 4종(기본/골드/브라운/화이트), 로그인 유지 시간(없음·3시간·6시간·영구),
  프로 결제 화면(카드/카카오페이 선택 UI 포함 시연용 플로우)
- **엑셀 내보내기**: 가계부 기록 + 누적 통계를 `.xlsx`로 다운로드(프로 전용). 안드로이드는
  폴더를 한 번만 선택하면 이후 자동 저장

## 기술 스택

- Expo (React Native, Web 지원) + TypeScript
- React Navigation (bottom tabs)
- Zustand + AsyncStorage (상태 저장/영속화)
- Firebase Authentication + Cloud Firestore (계정/데이터 동기화)
- `xlsx` + `expo-file-system` / `expo-sharing` (엑셀 내보내기)
- EAS Build (안드로이드 APK) / Firebase Hosting (웹 배포)

## 폴더 구조

```
App.tsx                     앱 진입점, 로그인 상태에 따라 인증/메인 화면 분기
src/
  navigation/                하단 탭 네비게이션 구성 (홈/수입/보스/목표/설정)
  screens/                   화면별 컴포넌트
    AuthScreen.tsx             로그인/회원가입/비밀번호 재설정
    HomeScreen.tsx             보유 메소, 예상 수입, 목표 요약, 프로 통계
    IncomeScreen.tsx           사냥 수입 입력, 솔 에르다 판매, 가계부, 엑셀 내보내기
    BossScreen.tsx             주간 보스 수입
    GoalScreen.tsx             목표 아이템 설정 및 달성 기간 계산
    SettingsScreen.tsx         테마, 로그인 유지 시간, 프로 결제, 개인정보처리방침
  store/                     Zustand 전역 상태
    usePlannerStore.ts          가계부/목표 등 핵심 데이터 (AsyncStorage 저장 + Firestore 동기화)
    useAuthStore.ts             Firebase 인증 상태, 로그인 유지 시간 정책 적용
    useSettingsStore.ts         로그인 유지 시간 설정 (기기 로컬)
    useThemeStore.ts            선택한 테마 (기기 로컬)
  components/                 공용 UI 컴포넌트 (Card, NumberField, Screen, FirebaseSync)
  services/firebase.ts        Firebase 앱/Auth/Firestore 초기화
  theme/                     색상 팔레트 4종 + 테마 훅
  types/                     공용 타입 정의
  utils/
    meso.ts                    메소 계산/포맷팅, 목표 달성 기간, 수수료 로직
    exportHuntingLog.ts        가계부 엑셀 내보내기 (웹 다운로드 / 안드로이드 직접 저장 / iOS 공유 시트)
```

## 핵심 계산 로직 (`src/utils/meso.ts`)

```
분당 사냥 수입 = 마리당 평균 메소 × 분당 마릿수
마리당 평균 메소 = 기준값 × (1 + 메소 획득량%/100) × (재물 획득의 비약 ? 1.2 : 1)
솔 에르다 순수익 = 개당 가격 × 판매 개수 × (1 - 수수료율)   # MVP 미적용 5% / 적용 3%
하루 평균 수입 = 가계부 평균(무료: 최근 7일 / 프로: 전체) 또는 현재 입력값 기준 추정치
목표 달성 예상일 = ceil((목표 가격 - 현재 보유 메소) / (하루 평균 수입 + 주간 보스 수입/7))
```

## 실행 방법

```bash
npm install
npm start        # Expo 개발 서버 실행 (QR코드로 Expo Go 앱에서 확인)
npm run android  # 안드로이드 에뮬레이터/기기
npm run ios      # iOS 시뮬레이터 (macOS 필요)
npm run web      # 웹 브라우저
npm run typecheck
```

Firebase 프로젝트 설정은 `src/services/firebase.ts`에 있으며, 별도의 Firebase 프로젝트
(Authentication + Firestore 활성화)가 필요합니다.

## 배포

```bash
# 웹 (Firebase Hosting)
npx expo export --platform web
firebase deploy --only hosting

# 안드로이드 APK (EAS Build, 내부 테스트/사이드로드용)
eas build --platform android --profile preview
```

## 다음 단계 아이디어

- 실제 인앱결제 연동 (RevenueCat) — 현재 프로 결제는 UI만 갖춘 시연용
- 여러 캐릭터 동시 관리
- iOS 출시 (Apple Developer 계정 필요)
- 사용자 지정 엑셀 양식 지원
- 광고 SDK 연동 + 광고 제거 옵션

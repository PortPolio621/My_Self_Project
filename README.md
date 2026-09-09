# 메소 플래너

메이플스토리 메소(재화) 관리용 모바일 앱. 사냥 수입과 주간 보스 수입을 등록하면
현재 보유 메소를 기준으로 목표 아이템을 구매하기까지 걸리는 예상 기간을 계산해줍니다.

## 기술 스택

- Expo (React Native) + TypeScript
- React Navigation (bottom tabs)
- Zustand + AsyncStorage (상태 저장/영속화)

## 폴더 구조

```
App.tsx                  앱 진입점
src/
  navigation/             하단 탭 네비게이션 구성
  screens/                홈 / 수입 / 보스 / 목표 화면
  store/                  Zustand 전역 상태 (AsyncStorage에 자동 저장)
  types/                  공용 타입 정의
  utils/meso.ts           메소 포맷팅 및 목표 달성 기간 계산 로직
  components/             공용 UI 컴포넌트 (Card, NumberField)
  theme/                  색상 팔레트
```

## 화면 구성

- **홈**: 보유 메소, 예상 하루 평균 수입, 목표 아이템까지 남은 기간 요약
- **수입**: 현재 보유 메소, 하루 평균 사냥 수입 입력
- **보스**: 주간 보스별 수입 등록/삭제, 이번 주 처치 체크
- **목표**: 목표 아이템 이름/가격 입력 시 예상 소요 기간 실시간 계산

## 핵심 계산 로직 (`src/utils/meso.ts`)

```
하루 평균 수입 = 하루 사냥 수입 + (주간 보스 수입 합계 / 7)
목표 달성 예상일 = ceil((목표 가격 - 현재 보유 메소) / 하루 평균 수입)
```

## 실행 방법

```bash
npm install
npm start        # Expo 개발 서버 실행 (QR코드로 Expo Go 앱에서 확인)
npm run android  # 안드로이드 에뮬레이터/기기
npm run ios      # iOS 시뮬레이터 (macOS 필요)
```

## 다음 단계 아이디어

- 사냥 수입 일별 기록/그래프
- 여러 목표 아이템 동시 관리
- 캐릭터별(멀티 캐릭터) 메소 관리 분리
- 아이템 시세 연동(마켓 API)으로 목표 가격 자동 갱신

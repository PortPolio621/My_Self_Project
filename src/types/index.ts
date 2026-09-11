/** 목표 아이템 */
export interface Goal {
  itemName: string;
  price: number;
}

/** 가계부에 기록된 하루치 사냥 수입 항목. 같은 날 여러 번 "확인"을 누르면 한 항목에 계속 누적된다 */
export interface HuntingLogEntry {
  id: string;
  /** 기록된 날짜 (기기 로컬 기준 YYYY-MM-DD) */
  date: string;
  /** 그 날 누적된 사냥 총 수익 (사냥 마릿수 수입 + 솔 에르다 조각 수익의 합) */
  totalMeso: number;
}

export interface PlannerState {
  /** 현재 보유 메소 */
  currentMeso: number;
  /** 사냥 마릿수 (1젠당 처치 마릿수, 34~40) */
  huntingKillCount: number;
  /** 사냥 시간(분) */
  huntingMinutes: number;
  /** 유저 메소 획득량 (%) */
  mesoGainPercent: number;
  /** 재물 획득의 비약 적용 여부 (최종 ×1.2) */
  useElixirOfWealth: boolean;
  /** 유니온의 부 적용 여부 (메소 획득량에 +50%p 합산) */
  useUnionWealth: boolean;
  /** 솔 에르다 조각 경매장 개당 가격 */
  solErdaPrice: number;
  /** 판매한 솔 에르다 조각 개수 */
  solErdaCount: number;
  /** MVP 등급 경매장 수수료 할인 적용 여부 (미적용 시 5%, 적용 시 3%) */
  useMvpDiscount: boolean;
  /** 주간 보스 총 수익 */
  weeklyBossIncome: number;
  /** 사냥 수입 가계부 기록 (날짜별 1건) */
  huntingLog: HuntingLogEntry[];
  /** '확인'을 누른 총 횟수 (같은 날 여러 번 눌러도 매번 증가) */
  huntingConfirmCount: number;
  /** 목표 아이템 (설정 전에는 null) */
  goal: Goal | null;
  /** 프로 결제 여부 (실제 결제 연동 전까지는 테스트용 수동 토글) */
  isPro: boolean;
}

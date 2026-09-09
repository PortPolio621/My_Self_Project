/** 목표 아이템 */
export interface Goal {
  itemName: string;
  price: number;
}

/** 가계부에 기록된 하루치 사냥 수입 항목 */
export interface HuntingLogEntry {
  id: string;
  /** 기록된 시각 (ISO 문자열) */
  recordedAt: string;
  /** 그날 기록한 사냥 총 수익 (사냥 마릿수 수입 + 솔 에르다 조각 수익) */
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
  /** 주간 보스 총 수익 */
  weeklyBossIncome: number;
  /** 사냥 수입 가계부 기록 */
  huntingLog: HuntingLogEntry[];
  /** 목표 아이템 (설정 전에는 null) */
  goal: Goal | null;
}

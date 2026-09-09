/** 목표 아이템 */
export interface Goal {
  itemName: string;
  price: number;
}

export interface PlannerState {
  /** 현재 보유 메소 */
  currentMeso: number;
  /** 사냥 마릿수 (1젠당 처치 마릿수, 34~40) */
  huntingKillCount: number;
  /** 하루 평균 사냥 시간(분) */
  huntingMinutesPerDay: number;
  /** 솔 에르다 조각 경매장 개당 가격 */
  solErdaPrice: number;
  /** 판매한 솔 에르다 조각 개수 */
  solErdaCount: number;
  /** 주간 보스 총 수익 */
  weeklyBossIncome: number;
  /** 목표 아이템 (설정 전에는 null) */
  goal: Goal | null;
}

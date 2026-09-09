/** 주간 보스 수입 항목 (예: 카오스 힐라, 스우 하드 등) */
export interface BossEntry {
  id: string;
  name: string;
  /** 이 보스를 처치했을 때 얻는 메소 (파티 분배 후 기준) */
  meso: number;
  /** 이번 주 처치 여부 - 체크된 항목만 주간 수입에 합산 */
  cleared: boolean;
}

/** 목표 아이템 */
export interface Goal {
  itemName: string;
  price: number;
}

export interface PlannerState {
  /** 현재 보유 메소 */
  currentMeso: number;
  /** 일일 사냥(파밍) 평균 수입 */
  dailyFarmingIncome: number;
  /** 주간 보스 수입 목록 */
  bossEntries: BossEntry[];
  /** 목표 아이템 (설정 전에는 null) */
  goal: Goal | null;
}

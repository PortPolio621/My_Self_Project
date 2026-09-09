import { BossEntry, PlannerState } from "@/types";

const EOK = 100_000_000; // 억
const MAN = 10_000; // 만

/** 메소 금액을 "12억 3,456만" 형태의 한글 단위 문자열로 변환 */
export function formatMeso(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const value = Math.abs(Math.round(amount));

  const eok = Math.floor(value / EOK);
  const man = Math.floor((value % EOK) / MAN);
  const rest = value % MAN;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man > 0) parts.push(`${man.toLocaleString("ko-KR")}만`);
  if (rest > 0 || parts.length === 0) parts.push(rest.toLocaleString("ko-KR"));

  return `${sign}${parts.join(" ")} 메소`;
}

/** 등록된 보스 항목의 주간 메소 합계 (체크 여부와 무관한 고정 수입원 기준) */
export function getWeeklyBossIncome(bossEntries: BossEntry[]): number {
  return bossEntries.reduce((sum, entry) => sum + entry.meso, 0);
}

/** 이번 주에 실제로 처치 완료(cleared)한 보스의 메소 합계 */
export function getClearedBossIncome(bossEntries: BossEntry[]): number {
  return bossEntries
    .filter((entry) => entry.cleared)
    .reduce((sum, entry) => sum + entry.meso, 0);
}

/** 사냥 수입 + 주간 보스 수입을 합산한 하루 평균 메소 수입 */
export function getDailyIncomeRate(state: Pick<PlannerState, "dailyFarmingIncome" | "bossEntries">): number {
  const weeklyBoss = getWeeklyBossIncome(state.bossEntries);
  return state.dailyFarmingIncome + weeklyBoss / 7;
}

export interface GoalEta {
  /** 목표 달성까지 필요한 메소 (이미 달성했다면 0) */
  remainingMeso: number;
  /** 목표 달성까지 걸리는 일수 (수입이 없으면 null) */
  days: number | null;
  /** 목표를 이미 달성했는지 여부 */
  achieved: boolean;
}

/** 목표 아이템 가격과 현재 상태로 목표 달성까지 걸리는 기간을 계산 */
export function calculateGoalEta(
  state: Pick<PlannerState, "currentMeso" | "dailyFarmingIncome" | "bossEntries">,
  goalPrice: number
): GoalEta {
  const remainingMeso = Math.max(goalPrice - state.currentMeso, 0);

  if (remainingMeso === 0) {
    return { remainingMeso: 0, days: 0, achieved: true };
  }

  const dailyIncomeRate = getDailyIncomeRate(state);
  if (dailyIncomeRate <= 0) {
    return { remainingMeso, days: null, achieved: false };
  }

  const days = Math.ceil(remainingMeso / dailyIncomeRate);
  return { remainingMeso, days, achieved: false };
}

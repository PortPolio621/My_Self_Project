import { PlannerState } from "@/types";

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

/** 선택 가능한 사냥 마릿수(1젠당 처치 마릿수) 범위 */
export const HUNTING_KILL_COUNT_MIN = 34;
export const HUNTING_KILL_COUNT_MAX = 40;

/** 마릿수 1당 시간당 처치량 배수 (1젠 마릿수 × 시간당 젠 횟수 480회 = 시간당 마릿수) */
const HOURLY_KILLS_PER_UNIT = 480;

/**
 * 마리당 평균 메소(실측치).
 * 사용자가 제공한 사냥 기록 시트의 총 획득 메소 ÷ 총 처치 마릿수 기준으로 산출:
 * 8,963,436,344.4 메소 ÷ 1,223,360마리 ≈ 7,327 메소/마리
 * 캐릭터가 성장하거나 사냥터가 바뀌면 이 기준값도 달라지므로 주기적으로 재보정이 필요하다.
 */
const MESO_PER_KILL = 7_327;

/** 사냥 마릿수(1젠 기준) → 시간당 마릿수 */
export function getHourlyKillCount(huntingKillCount: number): number {
  return huntingKillCount * HOURLY_KILLS_PER_UNIT;
}

/** 사냥 마릿수(1젠 기준) → 분당 마릿수 */
export function getPerMinuteKillCount(huntingKillCount: number): number {
  return getHourlyKillCount(huntingKillCount) / 60;
}

/** 분당 마릿수 × 마리당 평균 메소 = 분당 평균 메소 */
export function getMesoPerMinuteFromKills(huntingKillCount: number): number {
  return getPerMinuteKillCount(huntingKillCount) * MESO_PER_KILL;
}

/** 솔 에르다 조각 판매 수익 (개당 가격 × 판매 개수) */
export function getSolErdaIncome(
  state: Pick<PlannerState, "solErdaPrice" | "solErdaCount">
): number {
  return state.solErdaPrice * state.solErdaCount;
}

/** 사냥 마릿수 기반 수입 + 솔 에르다 조각 수익을 합산한 하루 사냥 수입 */
export function getDailyHuntingIncome(
  state: Pick<
    PlannerState,
    "huntingKillCount" | "huntingMinutesPerDay" | "solErdaPrice" | "solErdaCount"
  >
): number {
  const mesoFromKills =
    getMesoPerMinuteFromKills(state.huntingKillCount) * state.huntingMinutesPerDay;
  return mesoFromKills + getSolErdaIncome(state);
}

/** 사냥 수입 + 주간 보스 수입을 합산한 하루 평균 메소 수입 */
export function getDailyIncomeRate(
  state: Pick<
    PlannerState,
    | "huntingKillCount"
    | "huntingMinutesPerDay"
    | "solErdaPrice"
    | "solErdaCount"
    | "weeklyBossIncome"
  >
): number {
  return getDailyHuntingIncome(state) + state.weeklyBossIncome / 7;
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
  state: Pick<
    PlannerState,
    | "currentMeso"
    | "huntingKillCount"
    | "huntingMinutesPerDay"
    | "solErdaPrice"
    | "solErdaCount"
    | "weeklyBossIncome"
  >,
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

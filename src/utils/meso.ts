import { HuntingLogEntry, PlannerState } from "@/types";

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

/** 기기 로컬 기준 오늘 날짜를 "YYYY-MM-DD"로 반환 (가계부 날짜 경계는 자정 기준) */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 선택 가능한 사냥 마릿수(1젠당 처치 마릿수) 범위 */
export const HUNTING_KILL_COUNT_MIN = 34;
export const HUNTING_KILL_COUNT_MAX = 40;

/** 마릿수 1당 시간당 처치량 배수 (1젠 마릿수 × 시간당 젠 횟수 480회 = 시간당 마릿수) */
const HOURLY_KILLS_PER_UNIT = 480;

/**
 * 메소 획득량 0% 기준 마리당 평균 메소(실측 기준값).
 * 사용자가 제공한 사냥 기록 시트의 "미적용/적용 마리당 메소 (100% 기준)" 값(≈2244.7 / 2244.4)에서 산출.
 * 캐릭터가 성장하거나 사냥터가 바뀌면 이 기준값도 달라지므로 주기적으로 재보정이 필요하다.
 */
const BASE_MESO_PER_KILL = 2_244;

/** 재물 획득의 비약 배율 (다른 가산 보정이 모두 반영된 뒤 마지막에 곱연산) */
const ELIXIR_OF_WEALTH_MULTIPLIER = 1.2;

/** 유니온의 부가 메소 획득량(%)에 더하는 값 */
const UNION_WEALTH_BONUS_PERCENT = 50;

/** 사냥 마릿수(1젠 기준) → 시간당 마릿수 */
export function getHourlyKillCount(huntingKillCount: number): number {
  return huntingKillCount * HOURLY_KILLS_PER_UNIT;
}

/** 사냥 마릿수(1젠 기준) → 분당 마릿수 */
export function getPerMinuteKillCount(huntingKillCount: number): number {
  return getHourlyKillCount(huntingKillCount) / 60;
}

/** 유니온의 부까지 합산한 최종 메소 획득량(%) */
export function getEffectiveMesoGainPercent(
  state: Pick<PlannerState, "mesoGainPercent" | "useUnionWealth">
): number {
  return state.mesoGainPercent + (state.useUnionWealth ? UNION_WEALTH_BONUS_PERCENT : 0);
}

/**
 * 마리당 평균 메소 = 기준값 × (1 + 메소 획득량%/100) × (재물 획득의 비약 ? 1.2 : 1)
 * 재물 획득의 비약은 다른 가산 보정이 모두 반영된 뒤 마지막에 곱연산으로 적용한다.
 */
export function getMesoPerKill(
  state: Pick<PlannerState, "mesoGainPercent" | "useUnionWealth" | "useElixirOfWealth">
): number {
  const effectivePercent = getEffectiveMesoGainPercent(state);
  const beforeElixir = BASE_MESO_PER_KILL * (1 + effectivePercent / 100);
  return beforeElixir * (state.useElixirOfWealth ? ELIXIR_OF_WEALTH_MULTIPLIER : 1);
}

/** 분당 마릿수 × 마리당 평균 메소 = 분당 평균 메소 */
export function getMesoPerMinuteFromKills(
  state: Pick<
    PlannerState,
    "huntingKillCount" | "mesoGainPercent" | "useUnionWealth" | "useElixirOfWealth"
  >
): number {
  return getPerMinuteKillCount(state.huntingKillCount) * getMesoPerKill(state);
}

/** 솔 에르다 조각 판매 수익 (개당 가격 × 판매 개수) */
export function getSolErdaIncome(
  state: Pick<PlannerState, "solErdaPrice" | "solErdaCount">
): number {
  return state.solErdaPrice * state.solErdaCount;
}

/** 사냥 마릿수 기반 수입 + 솔 에르다 조각 수익을 합산한, 지금 입력값 기준 사냥 수입 */
export function getDailyHuntingIncome(
  state: Pick<
    PlannerState,
    | "huntingKillCount"
    | "huntingMinutes"
    | "mesoGainPercent"
    | "useUnionWealth"
    | "useElixirOfWealth"
    | "solErdaPrice"
    | "solErdaCount"
  >
): number {
  const mesoFromKills = getMesoPerMinuteFromKills(state) * state.huntingMinutes;
  return mesoFromKills + getSolErdaIncome(state);
}

/** 가계부에 기록된 사냥 수입들의 평균 (기록이 없으면 0) */
export function getAverageLoggedHuntingIncome(huntingLog: HuntingLogEntry[]): number {
  if (huntingLog.length === 0) return 0;
  const total = huntingLog.reduce((sum, entry) => sum + entry.totalMeso, 0);
  return total / huntingLog.length;
}

/**
 * 실제 사용할 하루 사냥 수입.
 * 가계부에 기록이 쌓여 있으면 그 평균을, 아직 없으면 지금 입력값 기준 추정치를 사용한다.
 */
export function getEffectiveDailyHuntingIncome(
  state: Pick<
    PlannerState,
    | "huntingKillCount"
    | "huntingMinutes"
    | "mesoGainPercent"
    | "useUnionWealth"
    | "useElixirOfWealth"
    | "solErdaPrice"
    | "solErdaCount"
    | "huntingLog"
  >
): number {
  if (state.huntingLog.length > 0) {
    return getAverageLoggedHuntingIncome(state.huntingLog);
  }
  return getDailyHuntingIncome(state);
}

/** 사냥 수입(가계부 평균 우선) + 주간 보스 수입을 합산한 하루 평균 메소 수입 */
export function getDailyIncomeRate(
  state: Pick<
    PlannerState,
    | "huntingKillCount"
    | "huntingMinutes"
    | "mesoGainPercent"
    | "useUnionWealth"
    | "useElixirOfWealth"
    | "solErdaPrice"
    | "solErdaCount"
    | "huntingLog"
    | "weeklyBossIncome"
  >
): number {
  return getEffectiveDailyHuntingIncome(state) + state.weeklyBossIncome / 7;
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
    | "huntingMinutes"
    | "mesoGainPercent"
    | "useUnionWealth"
    | "useElixirOfWealth"
    | "solErdaPrice"
    | "solErdaCount"
    | "huntingLog"
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

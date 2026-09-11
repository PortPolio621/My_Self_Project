import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { NumberField } from "@/components/NumberField";
import { Screen } from "@/components/Screen";
import { usePlannerStore } from "@/store/usePlannerStore";
import { colors } from "@/theme/colors";
import {
  HUNTING_KILL_COUNT_MAX,
  HUNTING_KILL_COUNT_MIN,
  formatMeso,
  getAverageLoggedHuntingIncome,
  getDailyHuntingIncome,
  getLocalDateKey,
  getMesoPerMinuteFromKills,
  getSolErdaFeeRate,
  getSolErdaIncome,
} from "@/utils/meso";

const KILL_COUNT_OPTIONS = Array.from(
  { length: HUNTING_KILL_COUNT_MAX - HUNTING_KILL_COUNT_MIN + 1 },
  (_, i) => HUNTING_KILL_COUNT_MIN + i
);

function CheckboxRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.checkboxRow} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

export function IncomeScreen() {
  const state = usePlannerStore();
  const setCurrentMeso = usePlannerStore((s) => s.setCurrentMeso);
  const setHuntingKillCount = usePlannerStore((s) => s.setHuntingKillCount);
  const setHuntingMinutes = usePlannerStore((s) => s.setHuntingMinutes);
  const setMesoGainPercent = usePlannerStore((s) => s.setMesoGainPercent);
  const toggleElixirOfWealth = usePlannerStore((s) => s.toggleElixirOfWealth);
  const toggleUnionWealth = usePlannerStore((s) => s.toggleUnionWealth);
  const setSolErdaPrice = usePlannerStore((s) => s.setSolErdaPrice);
  const setSolErdaCount = usePlannerStore((s) => s.setSolErdaCount);
  const toggleMvpDiscount = usePlannerStore((s) => s.toggleMvpDiscount);
  const confirmDailyHuntingIncome = usePlannerStore((s) => s.confirmDailyHuntingIncome);

  const mesoPerMinute = getMesoPerMinuteFromKills(state);
  const solErdaGrossIncome = state.solErdaPrice * state.solErdaCount;
  const solErdaFeeRate = getSolErdaFeeRate(state);
  const solErdaIncome = getSolErdaIncome(state);
  const dailyHuntingIncome = getDailyHuntingIncome(state);
  const averageLoggedIncome = getAverageLoggedHuntingIncome(state.huntingLog);

  const todayKey = getLocalDateKey();
  const todayEntry = state.huntingLog.find((entry) => entry.date === todayKey);

  return (
    <Screen>
      <Text style={styles.title}>수입 관리</Text>

      <Card style={styles.card}>
        <NumberField
          label="현재 보유 메소"
          value={state.currentMeso}
          onChangeValue={setCurrentMeso}
          placeholder="예: 500000000"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>사냥 마릿수 (1젠당 처치)</Text>
        <View style={styles.chipRow}>
          {KILL_COUNT_OPTIONS.map((count) => (
            <Pressable
              key={count}
              style={[
                styles.chip,
                state.huntingKillCount === count && styles.chipSelected,
              ]}
              onPress={() => setHuntingKillCount(count)}
            >
              <Text
                style={[
                  styles.chipText,
                  state.huntingKillCount === count && styles.chipTextSelected,
                ]}
              >
                {count}마리
              </Text>
            </Pressable>
          ))}
        </View>

        <NumberField
          label="메소 획득량 (%)"
          value={state.mesoGainPercent}
          onChangeValue={setMesoGainPercent}
          placeholder="예: 40"
          unit="count"
          countLabel="%"
        />
        <Text style={styles.fieldNote}>도핑하지 않은 상태의 능력치를 적으셔야 합니다.</Text>

        <CheckboxRow
          label="재물 획득의 비약 적용 (×1.2, 마지막에 곱연산)"
          checked={state.useElixirOfWealth}
          onToggle={toggleElixirOfWealth}
        />
        <CheckboxRow
          label="유니온의 부 적용 (메소 획득량 +50%p)"
          checked={state.useUnionWealth}
          onToggle={toggleUnionWealth}
        />

        <Text style={styles.rateText}>
          분당 약 {formatMeso(mesoPerMinute)}
        </Text>

        <NumberField
          label="사냥 시간(분)"
          value={state.huntingMinutes}
          onChangeValue={setHuntingMinutes}
          placeholder="예: 240"
          unit="count"
          countLabel="분"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>솔 에르다 조각 판매</Text>
        <NumberField
          label="경매장 개당 가격"
          value={state.solErdaPrice}
          onChangeValue={setSolErdaPrice}
          placeholder="예: 5000000"
        />
        <NumberField
          label="판매한 개수"
          value={state.solErdaCount}
          onChangeValue={setSolErdaCount}
          placeholder="예: 10"
          unit="count"
          countLabel="개"
        />
        <CheckboxRow
          label="MVP 등급 적용 (경매장 수수료 5% → 3%)"
          checked={state.useMvpDiscount}
          onToggle={toggleMvpDiscount}
        />
        {solErdaGrossIncome > 0 && (
          <>
            <Text style={styles.fieldNote}>
              수수료 {Math.round(solErdaFeeRate * 100)}% 제외한 순수익
            </Text>
            <Text style={styles.rateText}>조각 판매 수익: {formatMeso(solErdaIncome)}</Text>
          </>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>이번 회차 사냥 수입</Text>
        <Text style={styles.totalValue}>{formatMeso(dailyHuntingIncome)}</Text>
        <Pressable
          style={styles.confirmButton}
          onPress={() => confirmDailyHuntingIncome(dailyHuntingIncome)}
        >
          <Text style={styles.confirmButtonText}>확인 (가계부에 기록)</Text>
        </Pressable>
        {todayEntry && (
          <Text style={styles.hint}>
            오늘 누적 기록: {formatMeso(todayEntry.totalMeso)}
          </Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>평균 수입 합계</Text>
        <Text style={styles.totalValue}>{formatMeso(averageLoggedIncome)}</Text>
        <Text style={styles.hint}>
          {state.huntingLog.length > 0
            ? `가계부에 ${state.huntingLog.length}일 기록됨`
            : "아직 가계부 기록이 없어요. '확인'을 눌러 오늘 수입을 기록해보세요."}
        </Text>
        <Text style={styles.hint}>기록 횟수: {state.huntingConfirmCount}회</Text>
      </Card>

      <Text style={styles.hint}>
        주간 보스 수입은 '보스' 탭에서 관리할 수 있어요.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: colors.background,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 13,
  },
  checkboxLabel: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
  },
  rateText: {
    color: colors.primary,
    fontSize: 13,
    marginBottom: 12,
  },
  fieldNote: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: -8,
    marginBottom: 12,
  },
  totalValue: {
    color: colors.success,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

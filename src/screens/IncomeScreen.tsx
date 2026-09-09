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
  getDailyHuntingIncome,
  getMesoPerMinuteFromKills,
  getSolErdaIncome,
} from "@/utils/meso";

const KILL_COUNT_OPTIONS = Array.from(
  { length: HUNTING_KILL_COUNT_MAX - HUNTING_KILL_COUNT_MIN + 1 },
  (_, i) => HUNTING_KILL_COUNT_MIN + i
);

export function IncomeScreen() {
  const state = usePlannerStore();
  const setCurrentMeso = usePlannerStore((s) => s.setCurrentMeso);
  const setHuntingKillCount = usePlannerStore((s) => s.setHuntingKillCount);
  const setHuntingMinutesPerDay = usePlannerStore((s) => s.setHuntingMinutesPerDay);
  const setSolErdaPrice = usePlannerStore((s) => s.setSolErdaPrice);
  const setSolErdaCount = usePlannerStore((s) => s.setSolErdaCount);

  const mesoPerMinute = getMesoPerMinuteFromKills(state.huntingKillCount);
  const solErdaIncome = getSolErdaIncome(state);
  const dailyHuntingIncome = getDailyHuntingIncome(state);

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
        <Text style={styles.rateText}>
          분당 약 {formatMeso(mesoPerMinute)} (마리당 평균 메소 실측치 기준)
        </Text>

        <NumberField
          label="하루 평균 사냥 시간(분)"
          value={state.huntingMinutesPerDay}
          onChangeValue={setHuntingMinutesPerDay}
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
        {solErdaIncome > 0 && (
          <Text style={styles.rateText}>조각 판매 수익: {formatMeso(solErdaIncome)}</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>하루 사냥 수입 합계</Text>
        <Text style={styles.totalValue}>{formatMeso(dailyHuntingIncome)}</Text>
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
    marginBottom: 10,
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
  rateText: {
    color: colors.primary,
    fontSize: 13,
    marginBottom: 12,
  },
  totalValue: {
    color: colors.success,
    fontSize: 22,
    fontWeight: "700",
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

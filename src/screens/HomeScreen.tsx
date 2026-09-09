import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { usePlannerStore } from "@/store/usePlannerStore";
import { colors } from "@/theme/colors";
import {
  calculateGoalEta,
  formatMeso,
  getDailyIncomeRate,
  getWeeklyBossIncome,
} from "@/utils/meso";

export function HomeScreen() {
  const state = usePlannerStore();
  const dailyIncomeRate = getDailyIncomeRate(state);
  const weeklyBossIncome = getWeeklyBossIncome(state.bossEntries);
  const eta = state.goal ? calculateGoalEta(state, state.goal.price) : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>메소 플래너</Text>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>현재 보유 메소</Text>
        <Text style={styles.mesoValue}>{formatMeso(state.currentMeso)}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>예상 하루 평균 수입</Text>
        <Text style={styles.incomeValue}>{formatMeso(dailyIncomeRate)}</Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownText}>
            사냥 {formatMeso(state.dailyFarmingIncome)}/일
          </Text>
          <Text style={styles.breakdownText}>
            보스 {formatMeso(weeklyBossIncome)}/주
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>목표 아이템</Text>
        {!state.goal ? (
          <Text style={styles.emptyText}>목표 탭에서 아이템을 설정해보세요.</Text>
        ) : (
          <>
            <Text style={styles.goalName}>{state.goal.itemName}</Text>
            <Text style={styles.goalPrice}>{formatMeso(state.goal.price)}</Text>
            {eta?.achieved ? (
              <Text style={styles.achieved}>이미 목표를 달성했어요! 🎉</Text>
            ) : eta?.days === null ? (
              <Text style={styles.warning}>
                수입이 0이라 예상 기간을 계산할 수 없어요. 사냥/보스 수입을 입력해주세요.
              </Text>
            ) : (
              <>
                <Text style={styles.etaText}>
                  약 {eta?.days}일 후 달성 예상
                </Text>
                <Text style={styles.remainingText}>
                  부족한 메소: {formatMeso(eta?.remainingMeso ?? 0)}
                </Text>
              </>
            )}
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
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
  mesoValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "700",
  },
  incomeValue: {
    color: colors.success,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  goalName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  goalPrice: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  etaText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: "600",
  },
  remainingText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  achieved: {
    color: colors.success,
    fontSize: 16,
    fontWeight: "600",
  },
  warning: {
    color: colors.danger,
    fontSize: 13,
  },
});

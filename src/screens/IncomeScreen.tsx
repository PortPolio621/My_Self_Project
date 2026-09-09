import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { Card } from "@/components/Card";
import { NumberField } from "@/components/NumberField";
import { usePlannerStore } from "@/store/usePlannerStore";
import { colors } from "@/theme/colors";

export function IncomeScreen() {
  const currentMeso = usePlannerStore((s) => s.currentMeso);
  const dailyFarmingIncome = usePlannerStore((s) => s.dailyFarmingIncome);
  const setCurrentMeso = usePlannerStore((s) => s.setCurrentMeso);
  const setDailyFarmingIncome = usePlannerStore((s) => s.setDailyFarmingIncome);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>수입 관리</Text>

      <Card style={styles.card}>
        <NumberField
          label="현재 보유 메소"
          value={currentMeso}
          onChangeValue={setCurrentMeso}
          placeholder="예: 500000000"
        />
        <NumberField
          label="하루 평균 사냥 수입"
          value={dailyFarmingIncome}
          onChangeValue={setDailyFarmingIncome}
          placeholder="예: 30000000"
        />
      </Card>

      <Text style={styles.hint}>
        주간 보스 수입은 '보스' 탭에서 개별로 등록하고 관리할 수 있어요.
      </Text>
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
  hint: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

import React from "react";
import { StyleSheet, Text } from "react-native";

import { Card } from "@/components/Card";
import { NumberField } from "@/components/NumberField";
import { Screen } from "@/components/Screen";
import { usePlannerStore } from "@/store/usePlannerStore";
import { colors } from "@/theme/colors";

export function BossScreen() {
  const weeklyBossIncome = usePlannerStore((s) => s.weeklyBossIncome);
  const setWeeklyBossIncome = usePlannerStore((s) => s.setWeeklyBossIncome);

  return (
    <Screen>
      <Text style={styles.title}>주간 보스</Text>

      <Card style={styles.card}>
        <NumberField
          label="주간 보스 총 수익"
          value={weeklyBossIncome}
          onChangeValue={setWeeklyBossIncome}
          placeholder="예: 300000000"
        />
      </Card>

      <Text style={styles.hint}>
        잡는 보스 조합은 사람마다 다르니, 개별로 등록하는 대신 이번 주 보스로 벌어들인
        메소 총합을 한 번에 입력해주세요.
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
  hint: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

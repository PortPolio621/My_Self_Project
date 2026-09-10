import React from "react";
import { Alert, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { usePlannerStore } from "@/store/usePlannerStore";
import { colors } from "@/theme/colors";
import { calculateGoalEta, formatMeso, getEffectiveDailyHuntingIncome } from "@/utils/meso";

export function HomeScreen() {
  const state = usePlannerStore();
  const resetAll = usePlannerStore((s) => s.resetAll);
  const dailyHuntingIncome = getEffectiveDailyHuntingIncome(state);
  const eta = state.goal ? calculateGoalEta(state, state.goal.price) : null;

  const handleReset = () => {
    const message =
      "보유 메소, 사냥 설정, 가계부 기록, 목표를 모두 지우고 처음 상태로 되돌려요. 되돌릴 수 없어요.";

    // react-native-web의 Alert.alert은 아무 UI도 띄우지 않는 스텁이라 웹에서는 별도 처리
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(message)) {
        resetAll();
      }
      return;
    }

    Alert.alert("전체 데이터 초기화", message, [
      { text: "취소", style: "cancel" },
      { text: "초기화", style: "destructive", onPress: resetAll },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>메소 플래너</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>현재 보유 메소</Text>
        <Text style={styles.mesoValue}>{formatMeso(state.currentMeso)}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>예상 하루 평균 수입</Text>
        <Text style={styles.incomeValue}>
          {formatMeso(dailyHuntingIncome + state.weeklyBossIncome / 7)}
        </Text>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownText}>
            사냥 {formatMeso(dailyHuntingIncome)}/일
          </Text>
          <Text style={styles.breakdownText}>
            보스 {formatMeso(state.weeklyBossIncome)}/주
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

      <Pressable style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>전체 데이터 초기화</Text>
      </Pressable>
    </Screen>
  );
}

const LOGO_ASPECT_RATIO = 265 / 257;

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  logo: {
    width: 190,
    height: 190 / LOGO_ASPECT_RATIO,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
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
  resetButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  resetButtonText: {
    color: colors.danger,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});

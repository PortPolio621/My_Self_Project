import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";

import { Card } from "@/components/Card";
import { NumberField } from "@/components/NumberField";
import { usePlannerStore } from "@/store/usePlannerStore";
import { colors } from "@/theme/colors";
import { calculateGoalEta, formatMeso } from "@/utils/meso";

export function GoalScreen() {
  const state = usePlannerStore();
  const setGoal = usePlannerStore((s) => s.setGoal);

  const [itemName, setItemName] = useState(state.goal?.itemName ?? "");
  const [price, setPrice] = useState(state.goal?.price ?? 0);

  const eta = price > 0 ? calculateGoalEta(state, price) : null;

  const handleSave = () => {
    if (!itemName.trim() || price <= 0) return;
    setGoal({ itemName: itemName.trim(), price });
  };

  const handleClear = () => {
    setGoal(null);
    setItemName("");
    setPrice(0);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>목표 설정</Text>

      <Card style={styles.card}>
        <Text style={styles.label}>목표 아이템 이름</Text>
        <TextInput
          style={styles.textInput}
          value={itemName}
          onChangeText={setItemName}
          placeholder="예: 파프니르 무기"
          placeholderTextColor={colors.textMuted}
        />
        <NumberField
          label="목표 가격"
          value={price}
          onChangeValue={setPrice}
          placeholder="예: 3000000000"
        />

        {eta && (
          <Card style={styles.previewCard}>
            {eta.achieved ? (
              <Text style={styles.achieved}>이미 목표 금액을 달성했어요! 🎉</Text>
            ) : eta.days === null ? (
              <Text style={styles.warning}>
                수입이 0이라 예상 기간을 계산할 수 없어요. 먼저 수입 탭에서 수입을 입력해주세요.
              </Text>
            ) : (
              <>
                <Text style={styles.previewLabel}>예상 소요 기간</Text>
                <Text style={styles.previewDays}>약 {eta.days}일</Text>
                <Text style={styles.previewRemaining}>
                  부족한 메소: {formatMeso(eta.remainingMeso)}
                </Text>
              </>
            )}
          </Card>
        )}

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>목표 저장</Text>
        </Pressable>

        {state.goal && (
          <Pressable style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>목표 삭제</Text>
          </Pressable>
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
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: colors.surfaceAlt,
    marginBottom: 16,
  },
  previewLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  previewDays: {
    color: colors.success,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  previewRemaining: {
    color: colors.textMuted,
    fontSize: 13,
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
  clearButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  clearButtonText: {
    color: colors.danger,
    fontSize: 13,
  },
});

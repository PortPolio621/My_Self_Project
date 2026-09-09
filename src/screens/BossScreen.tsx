import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { NumberField } from "@/components/NumberField";
import { usePlannerStore } from "@/store/usePlannerStore";
import { colors } from "@/theme/colors";
import { formatMeso, getWeeklyBossIncome } from "@/utils/meso";

export function BossScreen() {
  const bossEntries = usePlannerStore((s) => s.bossEntries);
  const addBossEntry = usePlannerStore((s) => s.addBossEntry);
  const removeBossEntry = usePlannerStore((s) => s.removeBossEntry);
  const toggleBossCleared = usePlannerStore((s) => s.toggleBossCleared);
  const resetWeeklyBossClears = usePlannerStore((s) => s.resetWeeklyBossClears);

  const [name, setName] = useState("");
  const [meso, setMeso] = useState(0);

  const handleAdd = () => {
    if (!name.trim() || meso <= 0) return;
    addBossEntry({ name: name.trim(), meso, cleared: false });
    setName("");
    setMeso(0);
  };

  return (
    <View style={styles.screen}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={bossEntries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>주간 보스</Text>

            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>주간 보스 수입 합계</Text>
              <Text style={styles.summaryValue}>
                {formatMeso(getWeeklyBossIncome(bossEntries))}
              </Text>
            </Card>

            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>보스 추가</Text>
              <Text style={styles.label}>보스 이름</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="예: 카오스 힐라"
                placeholderTextColor={colors.textMuted}
              />
              <NumberField
                label="주간 처치 시 획득 메소"
                value={meso}
                onChangeValue={setMeso}
                placeholder="예: 15000000"
              />
              <Pressable style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>추가하기</Text>
              </Pressable>
            </Card>

            {bossEntries.length > 0 && (
              <Pressable style={styles.resetButton} onPress={resetWeeklyBossClears}>
                <Text style={styles.resetButtonText}>이번 주 처치 체크 초기화</Text>
              </Pressable>
            )}
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.bossCard}>
            <Pressable
              style={styles.bossRow}
              onPress={() => toggleBossCleared(item.id)}
            >
              <View style={[styles.checkbox, item.cleared && styles.checkboxChecked]}>
                {item.cleared && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.bossInfo}>
                <Text style={styles.bossName}>{item.name}</Text>
                <Text style={styles.bossMeso}>{formatMeso(item.meso)}</Text>
              </View>
              <Pressable onPress={() => removeBossEntry(item.id)} hitSlop={10}>
                <Text style={styles.removeText}>삭제</Text>
              </Pressable>
            </Pressable>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>등록된 보스가 없어요. 위에서 추가해보세요.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
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
  summaryCard: {
    marginBottom: 16,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "700",
  },
  formCard: {
    marginBottom: 12,
  },
  formTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
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
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
  resetButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },
  resetButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  bossCard: {
    marginBottom: 10,
    paddingVertical: 12,
  },
  bossRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 14,
  },
  bossInfo: {
    flex: 1,
  },
  bossName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  bossMeso: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  removeText: {
    color: colors.danger,
    fontSize: 13,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
});

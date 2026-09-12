import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { NumberField } from "@/components/NumberField";
import { Screen } from "@/components/Screen";
import { usePlannerStore } from "@/store/usePlannerStore";
import { ColorPalette } from "@/theme/colors";
import { useColors } from "@/theme/useColors";
import { exportHuntingLogToExcel } from "@/utils/exportHuntingLog";
import {
  FREE_TIER_LOG_WINDOW_DAYS,
  HUNTING_KILL_COUNT_MAX,
  HUNTING_KILL_COUNT_MIN,
  formatMeso,
  getAverageLoggedHuntingIncome,
  getDailyHuntingIncome,
  getLocalDateKey,
  getMesoPerMinuteFromKills,
  getRelevantHuntingLog,
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
  const colors = useColors();
  const styles = useMemo(() => createCheckboxStyles(colors), [colors]);

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
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
  const relevantHuntingLog = getRelevantHuntingLog(state.huntingLog, state.isPro);
  const averageLoggedIncome = getAverageLoggedHuntingIncome(relevantHuntingLog);
  const isLogLimited = !state.isPro && state.huntingLog.length > relevantHuntingLog.length;

  const todayKey = getLocalDateKey();
  const todayEntry = state.huntingLog.find((entry) => entry.date === todayKey);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const canExport = state.isPro && state.huntingLog.length > 0;

  const handleExport = async () => {
    if (!state.isPro) return;
    setExporting(true);
    setExportError(null);
    setExportSuccess(false);
    try {
      await exportHuntingLogToExcel(state.huntingLog, {
        totalSolErdaSoldCount: state.totalSolErdaSoldCount,
        totalSolErdaSoldIncome: state.totalSolErdaSoldIncome,
      });
      setExportSuccess(true);
    } catch {
      setExportError("다운로드에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setExporting(false);
    }
  };

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
          onPress={() =>
            confirmDailyHuntingIncome(dailyHuntingIncome, state.solErdaCount, solErdaIncome)
          }
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
        {isLogLimited ? (
          <Text style={styles.sectionNote}>
            무료 플랜은 평균 계산에 최근 {FREE_TIER_LOG_WINDOW_DAYS}일치 기록만 반영돼요. 이전
            기록은 계속 보관되며, 프로로 전환하면 전체 기간이 바로 반영돼요.
          </Text>
        ) : (
          !state.isPro && (
            <Text style={styles.sectionNote}>
              무료 플랜은 최근 {FREE_TIER_LOG_WINDOW_DAYS}일치 기록까지 평균에 반영돼요.
            </Text>
          )
        )}

        {state.isPro && Platform.OS === "android" && (
          <Text style={styles.sectionNote}>
            처음 한 번만 저장할 폴더를 선택하면, 다음부터는 바로 저장돼요.
          </Text>
        )}
        <Pressable
          style={[styles.exportButton, !canExport && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={!canExport || exporting}
        >
          <Text style={styles.exportButtonText}>
            {exporting ? "다운로드 중..." : "엑셀로 다운로드"}
          </Text>
        </Pressable>
        {!state.isPro && (
          <Text style={styles.sectionNote}>
            엑셀 다운로드는 프로 전용 기능이에요. 설정 탭에서 프로를 확인해보세요.
          </Text>
        )}
        {exportError && <Text style={styles.exportError}>{exportError}</Text>}
        {exportSuccess && !exportError && Platform.OS !== "ios" && (
          <Text style={styles.exportSuccess}>다운로드 완료!</Text>
        )}
      </Card>

      <Text style={styles.hint}>
        주간 보스 수입은 '보스' 탭에서 관리할 수 있어요.
      </Text>
    </Screen>
  );
}

function createCheckboxStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 13,
    },
    checkboxLabel: {
      color: colors.text,
      fontSize: 14,
      flex: 1,
    },
  });
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
      color: colors.onPrimary,
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
    sectionNote: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 4,
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
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    hint: {
      color: colors.textMuted,
      fontSize: 13,
    },
    exportButton: {
      marginTop: 12,
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    exportButtonDisabled: {
      opacity: 0.4,
    },
    exportButtonText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    exportError: {
      color: colors.danger,
      fontSize: 12,
      marginTop: 8,
    },
    exportSuccess: {
      color: colors.success,
      fontSize: 12,
      marginTop: 8,
    },
  });
}

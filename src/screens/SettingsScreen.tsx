import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { usePlannerStore } from "@/store/usePlannerStore";
import {
  SESSION_DURATION_LABELS,
  SessionDuration,
  useSettingsStore,
} from "@/store/useSettingsStore";
import { useThemeStore } from "@/store/useThemeStore";
import { ColorPalette, THEME_LABELS, THEME_NAMES, ThemeName, getColors } from "@/theme/colors";
import { useColors } from "@/theme/useColors";

const SESSION_DURATION_OPTIONS: SessionDuration[] = ["none", "3h", "6h", "forever"];

/** 아직 실제 결제(RevenueCat 등)가 연동되지 않아 테스트용으로 쓰는 월 구독 가격 */
const PRO_PRICE_LABEL = "월 3,300원";

export function SettingsScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const sessionDuration = useSettingsStore((s) => s.sessionDuration);
  const setSessionDuration = useSettingsStore((s) => s.setSessionDuration);

  const isPro = usePlannerStore((s) => s.isPro);
  const setIsPro = usePlannerStore((s) => s.setIsPro);

  return (
    <Screen>
      <Text style={styles.title}>설정</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>테마</Text>
        <View style={styles.chipRow}>
          {THEME_NAMES.map((name) => (
            <Pressable
              key={name}
              style={[styles.chip, theme === name && styles.chipSelected]}
              onPress={() => setTheme(name)}
            >
              <ThemeSwatch name={name} />
              <Text style={[styles.chipText, theme === name && styles.chipTextSelected]}>
                {THEME_LABELS[name]}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>로그인 유지 시간</Text>
        <Text style={styles.sectionNote}>
          선택한 시간이 지나면 다음에 앱을 열 때 자동으로 로그아웃돼요.
        </Text>
        <View style={styles.chipRow}>
          {SESSION_DURATION_OPTIONS.map((duration) => (
            <Pressable
              key={duration}
              style={[styles.chip, sessionDuration === duration && styles.chipSelected]}
              onPress={() => setSessionDuration(duration)}
            >
              <Text
                style={[
                  styles.chipText,
                  sessionDuration === duration && styles.chipTextSelected,
                ]}
              >
                {SESSION_DURATION_LABELS[duration]}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>메소 플래너 + 프로</Text>
        <Text style={styles.planStatus}>
          현재 플랜: {isPro ? "프로" : "무료"}
        </Text>
        {!isPro ? (
          <>
            <Text style={styles.proPrice}>{PRO_PRICE_LABEL}</Text>
            <Text style={styles.sectionNote}>
              가계부 무제한 보관, 엑셀 내보내기, 누적 통계 등을 이용할 수 있어요.
            </Text>
            <Pressable style={styles.proButton} onPress={() => setIsPro(true)}>
              <Text style={styles.proButtonText}>프로 시작하기</Text>
            </Pressable>
            <Text style={styles.proTestNote}>
              결제 연동 전 임시 버튼이에요. 실제 결제는 아직 청구되지 않아요.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionNote}>프로 혜택을 이용 중이에요. 감사합니다!</Text>
            <Pressable style={styles.proSecondaryButton} onPress={() => setIsPro(false)}>
              <Text style={styles.proSecondaryButtonText}>해지 (테스트용)</Text>
            </Pressable>
          </>
        )}
      </Card>
    </Screen>
  );
}

/** 테마 선택 칩 옆에 보여주는 작은 색상 미리보기 동그라미 */
function ThemeSwatch({ name }: { name: ThemeName }) {
  const palette = getColors(name);
  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 6,
        backgroundColor: palette.primary,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    />
  );
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
    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
    },
    sectionNote: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 12,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
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
    planStatus: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 8,
    },
    proPrice: {
      color: colors.primary,
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
    },
    proButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    proButtonText: {
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    proTestNote: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 8,
      textAlign: "center",
    },
    proSecondaryButton: {
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    proSecondaryButtonText: {
      color: colors.textMuted,
      fontSize: 13,
    },
  });
}

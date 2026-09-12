import React, { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { ColorPalette } from "@/theme/colors";
import { useColors } from "@/theme/useColors";
import { formatMeso } from "@/utils/meso";

interface NumberFieldProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  placeholder?: string;
  /** "meso": 입력값을 "x억 x만 메소"로 표시 (기본값). "count": "x개"로 표시 */
  unit?: "meso" | "count";
  /** unit이 "count"일 때 붙일 단위 (기본값 "개") */
  countLabel?: string;
}

/** 메소/가격/개수 같은 숫자를 입력받는 공용 필드. 입력값이 얼마인지 밑에 단위와 함께 보여준다 */
export function NumberField({
  label,
  value,
  onChangeValue,
  placeholder,
  unit = "meso",
  countLabel = "개",
}: NumberFieldProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={value === 0 ? "" : String(value)}
        placeholder={placeholder ?? "0"}
        placeholderTextColor={colors.textMuted}
        onChangeText={(text) => {
          const numeric = Number(text.replace(/[^0-9]/g, ""));
          onChangeValue(Number.isFinite(numeric) ? numeric : 0);
        }}
      />
      {value > 0 && (
        <Text style={styles.unitPreview}>
          {unit === "meso" ? formatMeso(value) : `${value.toLocaleString("ko-KR")}${countLabel}`}
        </Text>
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      marginBottom: 12,
    },
    label: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unitPreview: {
      color: colors.primary,
      fontSize: 12,
      marginTop: 4,
    },
  });
}

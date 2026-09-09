import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/theme/colors";

interface NumberFieldProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  placeholder?: string;
}

/** 메소/가격 같은 숫자를 입력받는 공용 필드. 빈 값이나 숫자가 아닌 입력은 0으로 취급 */
export function NumberField({ label, value, onChangeValue, placeholder }: NumberFieldProps) {
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});

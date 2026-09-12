import React, { PropsWithChildren, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { ColorPalette } from "@/theme/colors";
import { useColors } from "@/theme/useColors";

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.card, style]}>{children}</View>;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
}

import React, { PropsWithChildren, useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ColorPalette } from "@/theme/colors";
import { useColors } from "@/theme/useColors";

/** 상단 노치/상태바와 화면 콘텐츠 사이에 여백을 확보하는 공용 화면 래퍼 */
export function Screen({ children }: PropsWithChildren) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    screen: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingTop: 12,
      paddingBottom: 40,
    },
  });
}

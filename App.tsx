import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { FirebaseSync } from "@/components/FirebaseSync";
import { RootNavigator } from "@/navigation/RootNavigator";
import { AuthScreen } from "@/screens/AuthScreen";
import { useAuthStore } from "@/store/useAuthStore";
import { ColorPalette } from "@/theme/colors";
import { useColors } from "@/theme/useColors";

function AppContent() {
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <FirebaseSync />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
  });
}

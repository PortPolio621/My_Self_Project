import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import React, { useMemo } from "react";
import { Text } from "react-native";

import { BossScreen } from "@/screens/BossScreen";
import { GoalScreen } from "@/screens/GoalScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { IncomeScreen } from "@/screens/IncomeScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { ColorPalette } from "@/theme/colors";
import { useColors } from "@/theme/useColors";

export type RootTabParamList = {
  Home: undefined;
  Income: undefined;
  Boss: undefined;
  Goal: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, string> = {
  Home: "🏠",
  Income: "💰",
  Boss: "⚔️",
  Goal: "🎯",
  Settings: "⚙️",
};

const TAB_LABELS: Record<keyof RootTabParamList, string> = {
  Home: "홈",
  Income: "수입",
  Boss: "보스",
  Goal: "목표",
  Settings: "설정",
};

function createNavigationTheme(colors: ColorPalette) {
  return {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      primary: colors.primary,
      text: colors.text,
    },
  };
}

export function RootNavigator() {
  const colors = useColors();
  const navigationTheme = useMemo(() => createNavigationTheme(colors), [colors]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarIcon: () => (
            <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name as keyof RootTabParamList]}</Text>
          ),
          tabBarLabel: TAB_LABELS[route.name as keyof RootTabParamList],
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Income" component={IncomeScreen} />
        <Tab.Screen name="Boss" component={BossScreen} />
        <Tab.Screen name="Goal" component={GoalScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

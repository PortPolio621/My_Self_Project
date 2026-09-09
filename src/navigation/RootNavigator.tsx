import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Text } from "react-native";

import { BossScreen } from "@/screens/BossScreen";
import { GoalScreen } from "@/screens/GoalScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { IncomeScreen } from "@/screens/IncomeScreen";
import { colors } from "@/theme/colors";

export type RootTabParamList = {
  Home: undefined;
  Income: undefined;
  Boss: undefined;
  Goal: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, string> = {
  Home: "🏠",
  Income: "💰",
  Boss: "⚔️",
  Goal: "🎯",
};

const TAB_LABELS: Record<keyof RootTabParamList, string> = {
  Home: "홈",
  Income: "수입",
  Boss: "보스",
  Goal: "목표",
};

const navigationTheme = {
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

export function RootNavigator() {
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
      </Tab.Navigator>
    </NavigationContainer>
  );
}

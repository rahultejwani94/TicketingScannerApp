import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;

          if (route.name === "index") {
            iconName = focused ? "qr-code-outline" : "scan-outline";
          } else if (route.name === "all_tickets") {
            iconName = focused ? "ticket-outline" : "list-outline";
          } else if (route.name === "approve") {
            iconName = focused
              ? "checkmark-done-outline"
              : "checkmark-circle-outline";
          } else if (route.name === "dashboard") {
            iconName = focused ? "analytics-outline" : "grid-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",

        tabBarStyle: {
          backgroundColor: "#000",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Scan" }} />
      <Tabs.Screen name="all_tickets" options={{ title: "Tickets" }} />
      <Tabs.Screen name="approve" options={{ title: "Approve" }} />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
    </Tabs>
  );
}

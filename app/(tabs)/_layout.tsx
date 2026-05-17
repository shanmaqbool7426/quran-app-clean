import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const TAB_CONFIG = [
  { name: "index",   label: "Home",    iosIcon: "house.fill",         androidIcon: "home" as const,     color: "#10B981" },
  { name: "quran",   label: "Quran",   iosIcon: "book.fill",          androidIcon: "book-open" as const, color: "#3B82F6" },
  { name: "learn",   label: "Learn",   iosIcon: "graduationcap.fill",  androidIcon: "mic" as const,      color: "#A855F7" },
  { name: "tools",   label: "Tools",   iosIcon: "moon.stars.fill",    androidIcon: "moon" as const,     color: "#F59E0B" },
  { name: "profile", label: "Profile", iosIcon: "person.fill",        androidIcon: "user" as const,     color: "#EC4899" },
];

function AnimatedTabIcon({ focused, color, icon, iosIcon, isIOS }: {
  focused: boolean;
  color: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  iosIcon: string;
  isIOS: boolean;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const glow = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.1 : 0.9, useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.timing(glow, { toValue: focused ? 1 : 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }], alignItems: "center", justifyContent: "center" }}>
      {focused && (
        <Animated.View style={[styles.glowDot, { backgroundColor: color, opacity: glow }]} />
      )}
      {isIOS ? (
        <SymbolView name={iosIcon as any} tintColor={color} size={22} />
      ) : (
        <Feather name={icon} size={22} color={color} />
      )}
    </Animated.View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const tabBarHeight = isWeb ? 70 : 58;
  const bottomPad = Math.max(isWeb ? 20 : insets.bottom - 8, 6);

  return (
    <Tabs
      screenOptions={({ route }) => {
        const tabInfo = TAB_CONFIG.find(t => t.name === route.name);
        const tabColor = tabInfo?.color ?? colors.primary;

        return {
          headerShown: false,
          tabBarActiveTintColor: tabColor,
          tabBarInactiveTintColor: isDark ? "#475569" : "#94A3B8",
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : (isDark ? "#0A1525" : "#FFFFFF"),
            borderTopWidth: 0,
            elevation: 0,
            height: tabBarHeight + bottomPad,
            paddingBottom: bottomPad,
            paddingTop: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 20,
            ...(!isIOS && {
              borderTopColor: isDark ? "#1E3050" : "#E5F0EA",
              borderTopWidth: StyleSheet.hairlineWidth,
            }),
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: "Inter_600SemiBold",
            marginTop: 2,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={95}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "#0A1525" : "#FFFFFF" }]} />
            ),
          tabBarItemStyle: { gap: 1 },
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              icon={tabInfo?.androidIcon ?? "home"}
              iosIcon={tabInfo?.iosIcon ?? "house.fill"}
              isIOS={isIOS}
            />
          ),
        };
      }}
    >
      {TAB_CONFIG.map(tab => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glowDot: {
    position: "absolute",
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

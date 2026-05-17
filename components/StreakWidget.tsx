import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  streak: number;
  xp: number;
  level: number;
}

const ITEMS = [
  { icon: "zap" as const,   label: "Day Streak", bg: ["#F97316","#EF4444"] as [string,string] },
  { icon: "star" as const,  label: "Total XP",   bg: ["#F59E0B","#EAB308"] as [string,string] },
  { icon: "award" as const, label: "Level",      bg: ["#0D5C3A","#10B981"] as [string,string] },
];

export default function StreakWidget({ streak, xp, level }: Props) {
  const colors = useColors();
  const isDark = colors.background === "#0B1A2E";
  const xpForLevel = (level - 1) * 500;
  const xpProgress = Math.min(((xp - xpForLevel) / 500) * 100, 100);

  const values = [streak, xp, level];

  // Stagger entry animation
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    Animated.stagger(80, anims.map(a =>
      Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 })
    )).start();
  }, []);

  // XP bar animated width
  const xpWidth = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(xpWidth, { toValue: xpProgress, duration: 1200, delay: 400, useNativeDriver: false }).start();
  }, [xpProgress]);

  return (
    <View style={[styles.container, {
      backgroundColor: isDark ? "#0F1E30" : "#FFFFFF",
      borderColor: isDark ? "#1E3050" : "#D4E8DC",
    }]}>
      {ITEMS.map((item, i) => (
        <React.Fragment key={item.label}>
          <Animated.View style={[styles.item, {
            opacity: anims[i],
            transform: [{ scale: anims[i]!.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
          }]}>
            <LinearGradient colors={item.bg} style={styles.iconBg}>
              <Feather name={item.icon} size={17} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.value, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>
              {i === 2 ? `Lv. ${values[i]}` : values[i]}
            </Text>
            <Text style={[styles.label, { color: isDark ? "#64748B" : "#6B8C7A" }]}>{item.label}</Text>
            {i === 2 && (
              <View style={[styles.xpBarBg, { backgroundColor: isDark ? "#1E3050" : "#E5F0EA" }]}>
                <Animated.View style={[styles.xpBarFill, {
                  width: xpWidth.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                  backgroundColor: "#10B981",
                }]} />
              </View>
            )}
          </Animated.View>
          {i < ITEMS.length - 1 && (
            <View style={[styles.divider, { backgroundColor: isDark ? "#1E3050" : "#E5F0EA" }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  item: { flex: 1, alignItems: "center", gap: 5 },
  iconBg: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  value: { fontSize: 18, fontFamily: "Inter_700Bold" },
  label: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  divider: { width: 1, marginHorizontal: 8, borderRadius: 1 },
  xpBarBg: { width: "80%", height: 4, borderRadius: 2, overflow: "hidden", marginTop: 2 },
  xpBarFill: { height: "100%", borderRadius: 2 },
});

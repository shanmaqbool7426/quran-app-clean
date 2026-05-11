import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  streak: number;
  xp: number;
  level: number;
}

export default function StreakWidget({ streak, xp, level }: Props) {
  const colors = useColors();
  const xpForLevel = (level - 1) * 500;
  const xpProgress = ((xp - xpForLevel) / 500) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
      <View style={styles.item}>
        <LinearGradient colors={["#FF6B2B", "#FF8C00"]} style={styles.iconBg}>
          <Feather name="zap" size={18} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.value, { color: colors.foreground }]}>{streak}</Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Day Streak</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.item}>
        <LinearGradient colors={[colors.accent, colors.accentLight]} style={styles.iconBg}>
          <Feather name="star" size={18} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.value, { color: colors.foreground }]}>{xp}</Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Total XP</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.item}>
        <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.iconBg}>
          <Feather name="award" size={18} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.value, { color: colors.foreground }]}>Lv. {level}</Text>
        <View style={[styles.xpBar, { backgroundColor: colors.border }]}>
          <View style={[styles.xpFill, { backgroundColor: colors.primary, width: `${Math.min(xpProgress, 100)}%` as any }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    width: 1,
    marginHorizontal: 8,
  },
  xpBar: {
    width: "80%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 2,
  },
  xpFill: {
    height: "100%",
    borderRadius: 2,
  },
});

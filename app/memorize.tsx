import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SURAHS } from "@/constants/quranData";
import { useColors } from "@/hooks/useColors";

const PLANS = [
  { id: "1", name: "Juz Amma", surahs: 37, difficulty: "Beginner", duration: "30 days", color: "#22C55E", startSurah: 78 },
  { id: "2", name: "Short Surahs", surahs: 10, difficulty: "Beginner", duration: "14 days", color: "#3B82F6", startSurah: 112 },
  { id: "3", name: "Al-Fatiha", surahs: 1, difficulty: "Starter", duration: "3 days", color: "#8B5CF6", startSurah: 1 },
  { id: "4", name: "Custom Plan", surahs: 0, difficulty: "Custom", duration: "Flexible", color: "#C8972A", startSurah: null },
];

export default function MemorizeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState("3");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const memorizedSurahs = SURAHS.slice(0, 3);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Hifz Planner</Text>
        <Feather name="calendar" size={20} color={colors.primary} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Overview */}
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={[styles.progressCard, { borderRadius: colors.radius }]}
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Your Hifz Journey</Text>
              <Text style={styles.progressSub}>3 Surahs Memorized</Text>
            </View>
            <View style={[styles.progressCircle, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={styles.progressPct}>3%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "3%" }]} />
          </View>
          <Text style={styles.progressNote}>3 of 114 Surahs • 7 Ayahs memorized</Text>
        </LinearGradient>

        {/* Daily Mission */}
        <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.missionHeader}>
            <Feather name="target" size={20} color={colors.accent} />
            <Text style={[styles.missionTitle, { color: colors.foreground }]}>Today's Mission</Text>
          </View>
          <Text style={[styles.missionArabic, { color: colors.foreground }]}>
            اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
          </Text>
          <Text style={[styles.missionTrans, { color: colors.mutedForeground }]}>
            Al-Fatiha • Ayah 6 — Memorize and recite 3 times
          </Text>
          <TouchableOpacity
            style={[styles.missionBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const plan = PLANS.find(p => p.id === selectedPlan);
              if (plan?.startSurah) {
                router.push(`/surah/${plan.startSurah}?hifz=true` as any);
              } else {
                router.push("/(tabs)/quran" as any);
              }
            }}
          >
            <Feather name="play" size={14} color="#FFFFFF" />
            <Text style={styles.missionBtnText}>Start Session</Text>
          </TouchableOpacity>
        </View>

        {/* Learning Plans */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Learning Plans</Text>
          {PLANS.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                { backgroundColor: colors.card, borderColor: selectedPlan === plan.id ? plan.color : colors.border, borderWidth: selectedPlan === plan.id ? 2 : 1 }
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={[styles.planIcon, { backgroundColor: plan.color + "20" }]}>
                <Feather name="book-open" size={20} color={plan.color} />
              </View>
              <View style={styles.planInfo}>
                <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                <Text style={[styles.planMeta, { color: colors.mutedForeground }]}>
                  {plan.surahs > 0 ? `${plan.surahs} Surahs` : "Pick your own"} • {plan.duration}
                </Text>
              </View>
              <View style={[styles.diffBadge, { backgroundColor: plan.color + "20" }]}>
                <Text style={[styles.diffText, { color: plan.color }]}>{plan.difficulty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Memorized Surahs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Memorized Surahs</Text>
          {memorizedSurahs.map(surah => (
            <View key={surah.id} style={[styles.memRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.memCheck, { backgroundColor: "#22C55E" }]}>
                <Feather name="check" size={14} color="#FFFFFF" />
              </View>
              <View style={styles.memInfo}>
                <Text style={[styles.memName, { color: colors.foreground }]}>{surah.name}</Text>
                <Text style={[styles.memMeta, { color: colors.mutedForeground }]}>{surah.ayahs} ayahs</Text>
              </View>
              <Text style={[styles.memArabic, { color: colors.primary }]}>{surah.arabicName}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  progressCard: { padding: 20, gap: 12 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  progressSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  progressCircle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  progressPct: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 3 },
  progressNote: { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  missionCard: { padding: 18, borderRadius: 16, borderWidth: 1, gap: 12 },
  missionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  missionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  missionArabic: { fontSize: 22, fontWeight: "400", lineHeight: 40, textAlign: "right", writingDirection: "rtl" },
  missionTrans: { fontSize: 13, fontFamily: "Inter_400Regular" },
  missionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12 },
  missionBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  planCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14 },
  planIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  planInfo: { flex: 1 },
  planName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  planMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diffText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  memRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  memCheck: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  memInfo: { flex: 1 },
  memName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  memMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  memArabic: { fontSize: 18, fontWeight: "400" },
});

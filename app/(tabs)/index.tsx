import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import DailyAyahCard from "@/components/DailyAyahCard";
import PrayerTimesCard from "@/components/PrayerTimesCard";
import StreakWidget from "@/components/StreakWidget";
import { SURAHS } from "@/constants/quranData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";

const QUICK_ACTIONS = [
  { icon: "cpu" as const, label: "AI Scholar", color: "#8B5CF6", route: "/ai-chat" },
  { icon: "book-open" as const, label: "Read", color: "#0D5C3A", route: "/(tabs)/quran" },
  { icon: "headphones" as const, label: "Listen", color: "#2563EB", route: "/(tabs)/quran" },
  { icon: "navigation" as const, label: "Qibla", color: "#C8972A", route: "/qibla" },
];

function getHijriDateString(hijriDate: string, hijriMonth: string, hijriYear: string): string {
  if (hijriDate && hijriMonth) return `${hijriDate} ${hijriMonth} ${hijriYear} AH`;
  return "";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user: authUser, isAuthenticated } = useAuth();
  const { progress, lastRead, sessionMinutes, dailyGoalMinutes, userName } = useApp();
  const { hijriDate, hijriMonth, hijriYear } = useRealPrayerTimes();
  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const lastSurah = SURAHS.find(s => s.id === lastRead?.surahId);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const goalPct = Math.min(100, Math.round((sessionMinutes / dailyGoalMinutes) * 100));
  const displayName = isAuthenticated && authUser ? authUser.name : userName;
  const firstName = displayName.split(" ")[0] ?? "Friend";
  const completedSurahs = Object.values(progress.surahs).filter(s => s.completed).length;
  const hijriDisplay = getHijriDateString(hijriDate, hijriMonth, hijriYear);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={[styles.header, { paddingTop: topPadding + 16 }]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Assalamu Alaikum</Text>
              <Text style={styles.name}>{firstName} 🌙</Text>
              <Text style={styles.date}>{hijriDisplay} • {todayDate}</Text>
            </View>
            <TouchableOpacity
              style={[styles.aiBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
              onPress={() => router.push("/ai-chat")}
            >
              <Feather name="cpu" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.goalCompact, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <View style={styles.goalLabelRow}>
              <Feather name="target" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.goalLabel}>Daily Goal</Text>
              <Text style={styles.goalStat}>{sessionMinutes}/{dailyGoalMinutes} min</Text>
            </View>
            <View style={styles.goalBar}>
              <View style={[styles.goalFill, { width: `${goalPct}%` as any }]} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <StreakWidget streak={progress.streak} xp={progress.xp} level={progress.level} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Access</Text>
            <View style={styles.quickGrid}>
              {QUICK_ACTIONS.map(action => (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.quickItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickIcon, { backgroundColor: action.color + "15" }]}>
                    <Feather name={action.icon} size={20} color={action.color} />
                  </View>
                  <Text style={[styles.quickLabel, { color: colors.foreground }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Ayah</Text>
            <DailyAyahCard />
          </View>

          {lastSurah && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Continue Reading</Text>
              <TouchableOpacity
                style={[styles.continueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/surah/${lastSurah.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.continueNum, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.continueNumText, { color: colors.primary }]}>{lastSurah.id}</Text>
                </View>
                <View style={styles.continueInfo}>
                  <Text style={[styles.continueName, { color: colors.foreground }]}>{lastSurah.name}</Text>
                  <Text style={[styles.continueSub, { color: colors.mutedForeground }]}>
                    {lastSurah.arabicName} • Ayah {lastRead?.ayah}
                  </Text>
                </View>
                <View style={[styles.continueBtn, { backgroundColor: colors.primary }]}>
                  <Feather name="play" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Prayer Times</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/tools" as any)}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <PrayerTimesCard />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quran Progress</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="book" size={20} color={colors.primary} />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{progress.ayahsMemorized}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Ayahs</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="clock" size={20} color="#8B5CF6" />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{progress.totalMinutes}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Minutes</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="check-circle" size={20} color="#C8972A" />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{completedSurahs}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Surahs</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerLeft: { flex: 1, gap: 2 },
  greeting: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Inter_400Regular" },
  name: { color: "#FFFFFF", fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  date: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  aiBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", marginTop: 4 },
  goalCompact: { borderRadius: 12, padding: 14, gap: 8 },
  goalLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  goalLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  goalStat: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  goalBar: { height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" },
  goalFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 2 },
  content: { gap: 20, paddingTop: 20 },
  section: { gap: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", paddingHorizontal: 20 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  quickGrid: { flexDirection: "row", paddingHorizontal: 20, gap: 10 },
  quickItem: { flex: 1, alignItems: "center", gap: 8, padding: 12, borderRadius: 16, borderWidth: 1 },
  quickIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  continueCard: { marginHorizontal: 20, padding: 14, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  continueNum: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  continueNumText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  continueInfo: { flex: 1 },
  continueName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  continueSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  continueBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10 },
  statCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 1, gap: 6 },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
});

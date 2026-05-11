import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DailyAyahCard from "@/components/DailyAyahCard";
import PrayerTimesCard from "@/components/PrayerTimesCard";
import StreakWidget from "@/components/StreakWidget";
import { SURAHS } from "@/constants/quranData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";
import { fetchInsight } from "@/services/aiService";
import { DAILY_AYAHS } from "@/constants/quranData";
const QUICK_ACTIONS = [
  { image: require("@/assets/images/tools/ai-scholar.png"), label: "AI Scholar", color: "#8B5CF6", bg: "#F3EDFF", route: "/ai-chat" },
  { image: require("@/assets/images/tools/read.png"), label: "Read", color: "#0D5C3A", bg: "#E8F5EE", route: "/(tabs)/quran" },
  { image: require("@/assets/images/tools/listen_icon.png"), label: "Listen", color: "#2563EB", bg: "#EBF0FF", route: "/(tabs)/quran" },
  { image: require("@/assets/images/tools/qibla_icon.png"), label: "Qibla", color: "#C8972A", bg: "#FDF3DC", route: "/qibla" },
];

function getHijriDateString(hijriDate: string, hijriMonth: string, hijriYear: string): string {
  if (hijriDate && hijriMonth) return `${hijriDate} ${hijriMonth} ${hijriYear} AH`;
  const today = new Date();
  const hijriDay = ((today.getDate() + 9) % 30) + 1;
  const hijriMonths = ["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhu al-Qidah","Dhu al-Hijjah"];
  const hijriMonthName = hijriMonths[today.getMonth()] ?? "Ramadan";
  return `${hijriDay} ${hijriMonthName} 1446 AH`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress, lastRead, sessionMinutes, dailyGoalMinutes, userName } = useApp();
  const { hijriDate, hijriMonth, hijriYear } = useRealPrayerTimes();
  const [aiInsight, setAiInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);

  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const lastSurah = SURAHS.find(s => s.id === lastRead?.surahId);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const goalPct = Math.min(100, Math.round((sessionMinutes / dailyGoalMinutes) * 100));

  const todayAyahIdx = new Date().getDate() % DAILY_AYAHS.length;
  const todayAyah = DAILY_AYAHS[todayAyahIdx];

  useEffect(() => {
    if (todayAyah && !aiInsight) {
      loadInsight();
    }
  }, []);

  const loadInsight = async () => {
    if (!todayAyah) return;
    setInsightLoading(true);
    const insight = await fetchInsight(todayAyah.arabic, todayAyah.translation, todayAyah.reference);
    if (insight) setAiInsight(insight);
    setInsightLoading(false);
  };

  const hijriDisplay = getHijriDateString(hijriDate, hijriMonth, hijriYear);
  const firstName = userName.split(" ")[0] ?? "Friend";

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
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Assalamu Alaikum, {firstName} 🌙</Text>
              <Text style={styles.date}>{todayDate}</Text>
              <Text style={styles.hijri}>{hijriDisplay}</Text>
            </View>
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
              onPress={() => router.push("/ai-chat" as any)}
            >
              <Feather name="cpu" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.goalCard, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Daily Goal</Text>
              <Text style={styles.goalPercent}>{goalPct}%</Text>
            </View>
            <View style={styles.goalBar}>
              <View style={[styles.goalFill, { width: `${goalPct}%` as any }]} />
            </View>
            <Text style={styles.goalSub}>{sessionMinutes} of {dailyGoalMinutes} minutes completed today</Text>
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
                  <View style={[styles.quickIcon, { overflow: "hidden", backgroundColor: action.bg }]}>
                    <Image
                      source={action.image}
                      style={styles.quickImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={[styles.quickLabel, { color: colors.foreground }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Ayah</Text>
              {!insightLoading && !aiInsight && (
                <TouchableOpacity onPress={loadInsight}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>AI Insight</Text>
                </TouchableOpacity>
              )}
            </View>
            <DailyAyahCard />
            {aiInsight && (
              <View style={[styles.insightCard, { backgroundColor: "#8B5CF610", borderColor: "#8B5CF630" }]}>
                <View style={styles.insightHeader}>
                  <Feather name="cpu" size={14} color="#8B5CF6" />
                  <Text style={styles.insightLabel}>AI Insight</Text>
                </View>
                <Text style={[styles.insightText, { color: colors.foreground }]}>{aiInsight}</Text>
              </View>
            )}
          </View>

          {lastSurah && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Continue Reading</Text>
              <TouchableOpacity
                style={[styles.continueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(`/surah/${lastSurah.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.continueLeft}>
                  <View style={[styles.continueIcon, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.continueNum, { color: colors.primary }]}>{lastSurah.id}</Text>
                  </View>
                  <View>
                    <Text style={[styles.continueName, { color: colors.foreground }]}>{lastSurah.name}</Text>
                    <Text style={[styles.continueSub, { color: colors.mutedForeground }]}>
                      {lastSurah.arabicName} • Ayah {lastRead?.ayah}
                    </Text>
                  </View>
                </View>
                <View style={[styles.resumeBtn, { backgroundColor: colors.primary }]}>
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
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Progress</Text>
            <View style={[styles.statsRow, { gap: 12 }]}>
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
                <Text style={[styles.statVal, { color: colors.foreground }]}>
                  {Object.values(progress.surahs).filter(s => s.completed).length + 12}
                </Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Surahs</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.aiChatBanner, { backgroundColor: "#1A0533" }]}
            onPress={() => router.push("/ai-chat" as any)}
            activeOpacity={0.85}
          >
            <View style={styles.aiChatLeft}>
              <View style={[styles.aiChatBadge, { backgroundColor: "#8B5CF6" }]}>
                <Feather name="cpu" size={11} color="#FFFFFF" />
                <Text style={styles.aiChatBadgeText}>AI SCHOLAR</Text>
              </View>
              <Text style={styles.aiChatTitle}>Ask an Islamic Question</Text>
              <Text style={styles.aiChatSub}>Quran, Hadith, Fiqh, Islamic history</Text>
            </View>
            <View style={[styles.aiChatIconWrap]}>
              <Feather name="message-circle" size={32} color="#8B5CF6" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  date: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  hijri: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  goalCard: { borderRadius: 14, padding: 16 },
  goalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  goalTitle: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "Inter_500Medium" },
  goalPercent: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_700Bold" },
  goalBar: { height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden", marginBottom: 8 },
  goalFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 3 },
  goalSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  content: { gap: 24, paddingTop: 24 },
  section: { gap: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", paddingHorizontal: 20 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  quickGrid: { flexDirection: "row", paddingHorizontal: 20, gap: 12 },
  quickItem: { flex: 1, alignItems: "center", gap: 8, padding: 14, borderRadius: 16, borderWidth: 1 },
  quickIcon: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  quickImage: { width: 54, height: 54, borderRadius: 18 },
  quickLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  insightCard: { marginHorizontal: 20, padding: 16, borderRadius: 14, borderWidth: 1 },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  insightLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#8B5CF6" },
  insightText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 22 },
  continueCard: { marginHorizontal: 20, padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  continueLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  continueIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  continueNum: { fontSize: 15, fontFamily: "Inter_700Bold" },
  continueName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  continueSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  resumeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", paddingHorizontal: 20 },
  statCard: { flex: 1, alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 6 },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  aiChatBanner: { marginHorizontal: 20, padding: 20, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aiChatLeft: { flex: 1, gap: 8 },
  aiChatBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  aiChatBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1 },
  aiChatTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  aiChatSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular" },
  aiChatIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(139,92,246,0.2)", alignItems: "center", justifyContent: "center" },
});

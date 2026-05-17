import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import DailyAyahCard from "@/components/DailyAyahCard";
import PrayerTimesCard from "@/components/PrayerTimesCard";
import StreakWidget from "@/components/StreakWidget";
import { SURAHS } from "@/constants/quranData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";

const { width: SCREEN_W } = Dimensions.get("window");

const QUICK_ACTIONS = [
  { icon: "cpu" as const, label: "AI Scholar", color: "#A855F7", bg: ["#7C3AED", "#A855F7"] as [string, string], route: "/ai-chat" },
  { icon: "book-open" as const, label: "Read", color: "#10B981", bg: ["#059669", "#10B981"] as [string, string], route: "/(tabs)/quran" },
  { icon: "headphones" as const, label: "Listen", color: "#3B82F6", bg: ["#2563EB", "#3B82F6"] as [string, string], route: "/(tabs)/quran" },
  { icon: "navigation" as const, label: "Qibla", color: "#F59E0B", bg: ["#D97706", "#F59E0B"] as [string, string], route: "/qibla" },
];

const FEATURE_CARDS = [
  { icon: "mic" as const, label: "Recitation", sub: "Practice & Perfect", color: "#EC4899", bg: ["#9D174D", "#EC4899"] as [string, string], route: "/recitation" },
  { icon: "award" as const, label: "Memorize", sub: "Hifz Journey", color: "#8B5CF6", bg: ["#6D28D9", "#8B5CF6"] as [string, string], route: "/memorize" },
  { icon: "book" as const, label: "Hadith", sub: "Daily Wisdom", color: "#14B8A6", bg: ["#0F766E", "#14B8A6"] as [string, string], route: "/hadith" },
  { icon: "heart" as const, label: "Duas", sub: "Supplications", color: "#F97316", bg: ["#C2410C", "#F97316"] as [string, string], route: "/duas" },
  { icon: "repeat" as const, label: "Tasbeeh", sub: "Dhikr Counter", color: "#06B6D4", bg: ["#0E7490", "#06B6D4"] as [string, string], route: "/tasbeeh" },
  { icon: "percent" as const, label: "Zakat", sub: "Calculator", color: "#84CC16", bg: ["#4D7C0F", "#84CC16"] as [string, string], route: "/zakat" },
];

function getHijriDateString(d: string, m: string, y: string) {
  if (d && m) return `${d} ${m} ${y} AH`;
  return "";
}

function useAnimatedEntry(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, translateY };
}

// Floating orb decoration
function FloatingOrb({ color, size, top, left, delay }: { color: string; size: number; top: number; left: number; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000 + delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  return (
    <Animated.View
      style={{
        position: "absolute", top, left,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: 0.15,
        transform: [{ translateY }],
      }}
    />
  );
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

  const header = useAnimatedEntry(0);
  const stats = useAnimatedEntry(120);
  const quick = useAnimatedEntry(220);
  const ayah = useAnimatedEntry(320);
  const features = useAnimatedEntry(400);
  const prayer = useAnimatedEntry(480);

  // Pulsing ring for AI button
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const isDark = colors.background === "#0B1A2E";

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? "#060E1A" : "#F0F7F2" }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO HEADER ── */}
        <View style={{ overflow: "hidden" }}>
          <LinearGradient
            colors={isDark ? ["#0D2137", "#0F3D2A", "#0D2137"] : ["#0D5C3A", "#1A8A5A", "#0D5C3A"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: topPadding + 20 }]}
          >
            {/* Decorative floating orbs */}
            <FloatingOrb color="#10B981" size={120} top={-30} left={-30} delay={0} />
            <FloatingOrb color="#F59E0B" size={80} top={20} left={SCREEN_W - 100} delay={500} />
            <FloatingOrb color="#8B5CF6" size={60} top={80} left={SCREEN_W / 2} delay={1000} />

            {/* Islamic geometric overlay */}
            <View style={styles.geometricOverlay} pointerEvents="none">
              {[...Array(5)].map((_, i) => (
                <View key={i} style={[styles.geometricRing, {
                  width: 60 + i * 40, height: 60 + i * 40,
                  borderRadius: (60 + i * 40) / 2,
                  top: -20, right: -20,
                  borderColor: `rgba(255,255,255,${0.04 - i * 0.006})`,
                }]} />
              ))}
            </View>

            <Animated.View style={{ opacity: header.opacity, transform: [{ translateY: header.translateY }] }}>
              {/* Top row */}
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <View style={styles.greetingBadge}>
                    <Text style={styles.greetingBadgeText}>🌙 السلام عليكم</Text>
                  </View>
                  <Text style={styles.name}>{firstName}</Text>
                  <Text style={styles.date}>{hijriDisplay ? `${hijriDisplay}  •  ` : ""}{todayDate}</Text>
                </View>

                {/* AI button with pulse */}
                <TouchableOpacity onPress={() => router.push("/ai-chat")} activeOpacity={0.8}>
                  <Animated.View style={[styles.aiPulse, { transform: [{ scale: pulse }], borderColor: "rgba(168,85,247,0.5)" }]} />
                  <View style={styles.aiBtn}>
                    <LinearGradient colors={["#7C3AED", "#A855F7"]} style={styles.aiBtnGrad}>
                      <Feather name="cpu" size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Daily goal bar */}
              <View style={styles.goalCard}>
                <View style={styles.goalTop}>
                  <View style={styles.goalLeft}>
                    <Feather name="target" size={13} color="#F59E0B" />
                    <Text style={styles.goalLabel}>Daily Goal</Text>
                  </View>
                  <Text style={styles.goalPct}>{goalPct}%</Text>
                </View>
                <View style={styles.goalBarBg}>
                  <LinearGradient
                    colors={["#F59E0B", "#10B981"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.goalBarFill, { width: `${goalPct}%` as any }]}
                  />
                </View>
                <Text style={styles.goalSub}>{sessionMinutes} / {dailyGoalMinutes} minutes today</Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* ── STREAK STATS ── */}
        <Animated.View style={{ opacity: stats.opacity, transform: [{ translateY: stats.translateY }] }}>
          <StreakWidget streak={progress.streak} xp={progress.xp} level={progress.level} />
        </Animated.View>

        {/* ── QUICK ACCESS ── */}
        <Animated.View style={[styles.section, { opacity: quick.opacity, transform: [{ translateY: quick.translateY }] }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>Quick Access</Text>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickItem}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.75}
              >
                <LinearGradient colors={action.bg} style={styles.quickIconBg}>
                  <Feather name={action.icon} size={22} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.quickLabel, { color: isDark ? "#CBD5E1" : "#374151" }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── DAILY AYAH ── */}
        <Animated.View style={[styles.section, { opacity: ayah.opacity, transform: [{ translateY: ayah.translateY }] }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>✨ Ayah of the Day</Text>
          <DailyAyahCard />
        </Animated.View>

        {/* ── CONTINUE READING ── */}
        {lastSurah && (
          <Animated.View style={[styles.section, { opacity: features.opacity, transform: [{ translateY: features.translateY }] }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>Continue Reading</Text>
            <TouchableOpacity
              onPress={() => router.push(`/surah/${lastSurah.id}` as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isDark ? ["#0F2335", "#0D3B2A"] : ["#FFFFFF", "#F0FAF5"]}
                style={styles.continueCard}
              >
                <LinearGradient colors={["#0D5C3A", "#1A8A5A"]} style={styles.continueNum}>
                  <Text style={styles.continueNumText}>{lastSurah.id}</Text>
                </LinearGradient>
                <View style={styles.continueInfo}>
                  <Text style={[styles.continueName, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>{lastSurah.name}</Text>
                  <Text style={[styles.continueSub, { color: isDark ? "#94A3B8" : "#6B8C7A" }]}>
                    {lastSurah.arabicName} • Ayah {lastRead?.ayah}
                  </Text>
                </View>
                <View style={styles.continuePlay}>
                  <Feather name="play" size={16} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── FEATURE GRID ── */}
        <Animated.View style={[styles.section, { opacity: features.opacity, transform: [{ translateY: features.translateY }] }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>Explore Features</Text>
          <View style={styles.featureGrid}>
            {FEATURE_CARDS.map(card => (
              <TouchableOpacity
                key={card.label}
                onPress={() => router.push(card.route as any)}
                activeOpacity={0.8}
                style={styles.featureCard}
              >
                <LinearGradient
                  colors={isDark ? [card.bg[0] + "55", card.bg[1] + "22"] : [card.bg[0] + "18", card.bg[1] + "10"]}
                  style={[styles.featureCardInner, { borderColor: card.color + (isDark ? "44" : "33") }]}
                >
                  <LinearGradient colors={card.bg} style={styles.featureIcon}>
                    <Feather name={card.icon} size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.featureLabel, { color: isDark ? "#F1F5F9" : "#111827" }]}>{card.label}</Text>
                  <Text style={[styles.featureSub, { color: card.color }]}>{card.sub}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── QURAN PROGRESS ── */}
        <Animated.View style={[styles.section, { opacity: prayer.opacity, transform: [{ translateY: prayer.translateY }] }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>Quran Progress</Text>
          <View style={styles.statsRow}>
            {[
              { icon: "book" as const, val: progress.ayahsMemorized, lbl: "Ayahs", color: "#10B981", bg: ["#059669", "#10B981"] as [string, string] },
              { icon: "clock" as const, val: progress.totalMinutes, lbl: "Minutes", color: "#8B5CF6", bg: ["#7C3AED", "#8B5CF6"] as [string, string] },
              { icon: "check-circle" as const, val: completedSurahs, lbl: "Surahs", color: "#F59E0B", bg: ["#D97706", "#F59E0B"] as [string, string] },
            ].map(stat => (
              <View key={stat.lbl} style={[styles.statCard, {
                backgroundColor: isDark ? "#0F1E30" : "#FFFFFF",
                borderColor: isDark ? "#1E3050" : "#D4E8DC",
              }]}>
                <LinearGradient colors={stat.bg} style={styles.statIcon}>
                  <Feather name={stat.icon} size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.statVal, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>{stat.val}</Text>
                <Text style={[styles.statLbl, { color: stat.color }]}>{stat.lbl}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── PRAYER TIMES ── */}
        <Animated.View style={[styles.section, { opacity: prayer.opacity, transform: [{ translateY: prayer.translateY }], paddingBottom: 10 }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>🕌 Prayer Times</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/tools" as any)}>
              <Text style={[styles.seeAll, { color: "#10B981" }]}>See all →</Text>
            </TouchableOpacity>
          </View>
          <PrayerTimesCard />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  /* HEADER */
  header: { paddingHorizontal: 20, paddingBottom: 24, position: "relative", overflow: "hidden" },
  geometricOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  geometricRing: { position: "absolute", borderWidth: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  headerLeft: { flex: 1, gap: 4 },
  greetingBadge: { alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 6 },
  greetingBadgeText: { color: "rgba(255,255,255,0.95)", fontSize: 13, fontFamily: "Inter_500Medium" },
  name: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  date: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  /* AI Button */
  aiBtn: { width: 50, height: 50, borderRadius: 25 },
  aiBtnGrad: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  aiPulse: { position: "absolute", width: 56, height: 56, borderRadius: 28, borderWidth: 2, top: -3, left: -3 },

  /* Goal bar */
  goalCard: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 14, gap: 8 },
  goalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  goalLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_500Medium" },
  goalPct: { color: "#F59E0B", fontSize: 14, fontFamily: "Inter_700Bold" },
  goalBarBg: { height: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" },
  goalBarFill: { height: "100%", borderRadius: 3 },
  goalSub: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "Inter_400Regular" },

  /* SECTIONS */
  section: { gap: 14, paddingTop: 24 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", paddingHorizontal: 20 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  /* QUICK ACCESS */
  quickRow: { flexDirection: "row", paddingHorizontal: 20, gap: 12 },
  quickItem: { flex: 1, alignItems: "center", gap: 8 },
  quickIconBg: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  quickLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },

  /* CONTINUE READING */
  continueCard: { marginHorizontal: 20, padding: 16, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  continueNum: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  continueNumText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  continueInfo: { flex: 1 },
  continueName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  continueSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  continuePlay: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#0D5C3A", alignItems: "center", justifyContent: "center" },

  /* FEATURE GRID */
  featureGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  featureCard: { width: (SCREEN_W - 52) / 3 },
  featureCardInner: { borderRadius: 18, padding: 14, alignItems: "center", gap: 8, borderWidth: 1 },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  featureLabel: { fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "center" },
  featureSub: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },

  /* STATS */
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10 },
  statCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 18, borderWidth: 1, gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});

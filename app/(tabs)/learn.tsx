import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
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

import { QAIDA_LESSONS } from "@/constants/qaida";
import {
  LEARN_FEATURE_CARDS,
  LEARN_HERO,
  LEARN_QAIDA_SECTION,
  resolveLearnGradient,
} from "@/constants/learnHub";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useQaidaProgress } from "@/hooks/useQaidaProgress";

const { width: SCREEN_W } = Dimensions.get("window");
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function useEntry(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 550, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 550, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
}

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress, hifzSessions } = useApp();
  const { completedCount, totalLessons, isLessonComplete, isLessonUnlocked, unlockHint } = useQaidaProgress();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isDark = colors.background === "#0B1A2E";

  const nextLessonId = useMemo(() => {
    for (const l of QAIDA_LESSONS) {
      if (isLessonUnlocked(l.id) && !isLessonComplete(l.id)) return l.id;
    }
    return undefined;
  }, [isLessonUnlocked, isLessonComplete]);

  const headerSubtitle = useMemo(() => {
    if (completedCount === 0) return "Start your Islamic learning journey today.";
    if (completedCount >= totalLessons) return "Qaida complete! Continue with Quran & Hifz.";
    return `${completedCount} of ${totalLessons} Qaida lessons done — keep going!`;
  }, [completedCount, totalLessons]);

  const completedSurahs = Object.values(progress.surahs).filter(s => s.completed).length;
  const startedSurahs = Object.values(progress.surahs).filter(s => s.started).length;
  const practiceThisWeek = useMemo(() => {
    const cutoff = Date.now() - WEEK_MS;
    return hifzSessions.filter(s => s.timestamp >= cutoff).length;
  }, [hifzSessions]);

  const stats = [
    { icon: "mic" as const,         val: hifzSessions.length, lbl: "Hifz Logs",   bg: ["#7C3AED","#A855F7"] as [string,string] },
    { icon: "clock" as const,        val: progress.totalMinutes, lbl: "Minutes",    bg: ["#0D5C3A","#10B981"] as [string,string] },
    { icon: "check-circle" as const, val: completedSurahs,    lbl: "Surahs Done", bg: ["#D97706","#F59E0B"] as [string,string] },
    { icon: "calendar" as const,     val: practiceThisWeek,   lbl: "This Week",   bg: ["#2563EB","#3B82F6"] as [string,string] },
  ];

  const qaidaPct = totalLessons ? Math.min(100, (completedCount / totalLessons) * 100) : 0;

  // Animated XP bar for Qaida progress
  const qaidaBarAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(qaidaBarAnim, { toValue: qaidaPct, duration: 1200, delay: 600, useNativeDriver: false }).start();
  }, [qaidaPct]);

  // Pulse for AI button
  const aiPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(aiPulse, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(aiPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const heroEntry = useEntry(0);
  const featEntry = useEntry(120);
  const qaidaEntry = useEntry(220);
  const statsEntry = useEntry(340);

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? "#060E1A" : "#F0F7F2" }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <LinearGradient
          colors={isDark ? ["#2D1B69","#1E0545","#0D1F3C"] : ["#4C1D95","#7C3AED","#0D5C3A"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: topPadding + 20 }]}
        >
          {/* Decorative rings */}
          {[...Array(4)].map((_, i) => (
            <View key={i} style={[styles.ring, {
              width: 80 + i * 50, height: 80 + i * 50,
              borderRadius: (80 + i * 50) / 2,
              top: -20, right: -10,
              borderColor: `rgba(255,255,255,${0.07 - i * 0.015})`,
            }]} />
          ))}
          <Animated.View style={heroEntry}>
            <View style={styles.headerBadge}>
              <Feather name="book-open" size={11} color="#A78BFA" />
              <Text style={styles.headerBadgeText}>LEARNING CENTER</Text>
            </View>
            <Text style={styles.headerTitle}>Learn & Grow</Text>
            <Text style={styles.headerSub}>{headerSubtitle}</Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          {/* ── AI HERO CARD ── */}
          <Animated.View style={heroEntry}>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(LEARN_HERO.href); }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#1E0545","#3B0764","#4C1D95"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                {[...Array(3)].map((_, i) => (
                  <View key={i} style={[styles.heroRing, {
                    width: 70 + i * 45, height: 70 + i * 45,
                    borderRadius: (70 + i * 45) / 2,
                    right: -10, bottom: -10,
                    borderColor: `rgba(168,85,247,${0.2 - i * 0.05})`,
                  }]} />
                ))}
                <View style={styles.heroLeft}>
                  <View style={styles.heroBadge}>
                    <View style={styles.heroBadgeDot} />
                    <Text style={styles.heroBadgeText}>AI POWERED • LIVE</Text>
                  </View>
                  <Text style={styles.heroTitle}>{LEARN_HERO.title}</Text>
                  <Text style={styles.heroSub}>{LEARN_HERO.subtitle}</Text>
                  <Animated.View style={{ transform: [{ scale: aiPulse }], alignSelf: "flex-start" }}>
                    <View style={styles.heroBtn}>
                      <Text style={styles.heroBtnText}>{LEARN_HERO.cta}</Text>
                      <Feather name="arrow-right" size={13} color="#7C3AED" />
                    </View>
                  </Animated.View>
                </View>
                <LinearGradient colors={["#7C3AED","#A855F7"]} style={styles.heroIconCircle}>
                  <Feather name="cpu" size={30} color="#FFFFFF" />
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ── FEATURE CARDS ── */}
          <Animated.View style={[styles.section, featEntry]}>
            <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>📚 Learning Paths</Text>
            <View style={styles.featureRow}>
              {LEARN_FEATURE_CARDS.map((card, idx) => {
                const isComingSoon = false; // recitation is now live
                const gradColors = resolveLearnGradient(card.gradient, colors.primary, colors.primaryLight);
                return (
                  <TouchableOpacity
                    key={card.id}
                    onPress={() => {
                      if (isComingSoon) return;
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(card.href);
                    }}
                    activeOpacity={isComingSoon ? 1 : 0.85}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={[...gradColors] as [string, string]}
                      style={[styles.halfCard, { opacity: isComingSoon ? 0.6 : 1 }]}
                    >
                      <View style={styles.halfIconBg}>
                        <Feather name={card.icon} size={26} color="#FFFFFF" />
                      </View>
                      <Text style={styles.halfTitle}>{card.title}</Text>
                      <Text style={styles.halfSub}>{card.subtitle}</Text>
                      {isComingSoon && (
                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonText}>Soon</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* ── QAIDA PROGRESS ── */}
          <Animated.View style={[styles.section, qaidaEntry]}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>🕌 Noorani Qaida</Text>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(LEARN_QAIDA_SECTION.href); }}>
                <Text style={[styles.seeAll, { color: "#10B981" }]}>{LEARN_QAIDA_SECTION.linkLabel} →</Text>
              </TouchableOpacity>
            </View>

            {/* Progress bar card */}
            <LinearGradient
              colors={isDark ? ["#0F2335","#0D3B2A"] : ["#F0FAF5","#FFFFFF"]}
              style={[styles.qaidaCard, { borderColor: isDark ? "#1E3050" : "#D4E8DC" }]}
            >
              <View style={styles.qaidaTop}>
                <View>
                  <Text style={[styles.qaidaLabel, { color: isDark ? "#94A3B8" : "#6B8C7A" }]}>Overall Progress</Text>
                  <Text style={[styles.qaidaVal, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>{completedCount}/{totalLessons} Lessons</Text>
                </View>
                <View style={[styles.qaidaPctBadge, { backgroundColor: "#10B98122" }]}>
                  <Text style={[styles.qaidaPctText, { color: "#10B981" }]}>{Math.round(qaidaPct)}%</Text>
                </View>
              </View>
              <View style={[styles.qaidaBarBg, { backgroundColor: isDark ? "#1E3050" : "#E5F0EA" }]}>
                <Animated.View style={{
                  height: "100%", borderRadius: 4,
                  width: qaidaBarAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                  backgroundColor: "#10B981",
                }} />
              </View>
              <Text style={[styles.qaidaHint, { color: isDark ? "#64748B" : "#6B8C7A" }]}>{LEARN_QAIDA_SECTION.progressHint}</Text>
            </LinearGradient>

            {/* Lesson rows */}
            {QAIDA_LESSONS.map((lesson) => {
              const locked = !isLessonUnlocked(lesson.id);
              const done = isLessonComplete(lesson.id);
              const isNext = lesson.id === nextLessonId;
              const hint = unlockHint(lesson.id);

              let badgeBg: [string, string] = done
                ? ["#059669","#10B981"]
                : locked
                  ? [isDark ? "#1E2A3A" : "#E5F0EA", isDark ? "#1E2A3A" : "#E5F0EA"]
                  : isNext
                    ? ["#0D5C3A","#1A8A5A"]
                    : ["#1E3050","#243B55"];

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonRow,
                    {
                      backgroundColor: isDark ? "#0F1E30" : "#FFFFFF",
                      borderColor: isNext && !done && !locked
                        ? "#10B981"
                        : isDark ? "#1E3050" : "#D4E8DC",
                      borderWidth: isNext && !done && !locked ? 1.5 : 1,
                      opacity: locked ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => {
                    if (locked) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); return; }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/lesson/${lesson.id}` as const);
                  }}
                  activeOpacity={locked ? 1 : 0.75}
                >
                  <LinearGradient colors={badgeBg} style={styles.lessonNum}>
                    {done ? (
                      <Feather name="check" size={15} color="#FFFFFF" />
                    ) : locked ? (
                      <Feather name="lock" size={13} color={isDark ? "#64748B" : "#94A3B8"} />
                    ) : (
                      <Text style={styles.lessonNumText}>{lesson.id}</Text>
                    )}
                  </LinearGradient>
                  <View style={styles.lessonInfo}>
                    <View style={styles.lessonTitleRow}>
                      <Text style={[styles.lessonTitle, { color: locked ? (isDark ? "#475569" : "#94A3B8") : (isDark ? "#F1F5F9" : "#0A1E0F") }]}>
                        {lesson.title}
                      </Text>
                      {isNext && !done && !locked && (
                        <View style={styles.nextPill}>
                          <Text style={styles.nextPillText}>NEXT</Text>
                        </View>
                      )}
                      {done && (
                        <View style={styles.donePill}>
                          <Text style={styles.donePillText}>DONE ✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.lessonSub, { color: isDark ? "#64748B" : "#6B8C7A" }]}>{lesson.subtitle}</Text>
                    {locked && hint && <Text style={[styles.lockHint, { color: isDark ? "#475569" : "#94A3B8" }]}>{hint}</Text>}
                  </View>
                  {!locked && !done && (
                    <LinearGradient colors={["#0D5C3A","#10B981"]} style={styles.playBtn}>
                      <Feather name="play" size={12} color="#FFFFFF" />
                    </LinearGradient>
                  )}
                  {done && <Feather name="chevron-right" size={18} color={isDark ? "#475569" : "#94A3B8"} />}
                </TouchableOpacity>
              );
            })}
          </Animated.View>

          {/* ── ACTIVITY STATS ── */}
          <Animated.View style={[styles.section, statsEntry]}>
            <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>📊 Your Activity</Text>
            {startedSurahs > 0 && (
              <View style={[styles.activityHint, { backgroundColor: isDark ? "#0F1E30" : "#F0FAF5", borderColor: isDark ? "#1E3050" : "#D4E8DC" }]}>
                <Feather name="info" size={13} color="#10B981" />
                <Text style={[styles.activityHintText, { color: isDark ? "#94A3B8" : "#6B8C7A" }]}>
                  {startedSurahs} surah{startedSurahs > 1 ? "s" : ""} in progress in the Quran tab
                </Text>
              </View>
            )}
            <View style={styles.statsGrid}>
              {stats.map((stat, i) => (
                <View key={stat.lbl} style={[styles.statCard, { backgroundColor: isDark ? "#0F1E30" : "#FFFFFF", borderColor: isDark ? "#1E3050" : "#D4E8DC" }]}>
                  <LinearGradient colors={stat.bg} style={styles.statIcon}>
                    <Feather name={stat.icon} size={16} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.statVal, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>{stat.val}</Text>
                  <Text style={[styles.statLbl, { color: stat.bg[0] }]}>{stat.lbl}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  /* Header */
  header: { paddingHorizontal: 20, paddingBottom: 28, overflow: "hidden", position: "relative" },
  ring: { position: "absolute", borderWidth: 1 },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start", marginBottom: 8 },
  headerBadgeText: { color: "#A78BFA", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.65)", marginTop: 5, lineHeight: 20 },

  content: { padding: 16, gap: 24 },
  section: { gap: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  /* Hero card */
  heroCard: { borderRadius: 22, padding: 22, flexDirection: "row", alignItems: "center", gap: 16, overflow: "hidden" },
  heroRing: { position: "absolute", borderWidth: 1 },
  heroLeft: { flex: 1, gap: 10 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(168,85,247,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#A855F7" },
  heroBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#C4B5FD", letterSpacing: 1 },
  heroTitle: { fontSize: 19, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  heroSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", lineHeight: 18 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" },
  heroBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#7C3AED" },
  heroIconCircle: { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  /* Feature row */
  featureRow: { flexDirection: "row", gap: 12 },
  halfCard: { borderRadius: 20, padding: 18, alignItems: "center", gap: 10, overflow: "hidden" },
  halfIconBg: { width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  halfTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  halfSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 16 },
  comingSoonBadge: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.35)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  comingSoonText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Inter_700Bold" },

  /* Qaida */
  qaidaCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  qaidaTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  qaidaLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  qaidaVal: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 2 },
  qaidaPctBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  qaidaPctText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  qaidaBarBg: { height: 6, borderRadius: 4, overflow: "hidden" },
  qaidaHint: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },

  /* Lesson rows */
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  lessonNum: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  lessonNumText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  lessonInfo: { flex: 1 },
  lessonTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  lessonTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  lessonSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  lockHint: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 3 },
  nextPill: { backgroundColor: "#10B98122", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  nextPillText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#10B981", letterSpacing: 0.5 },
  donePill: { backgroundColor: "#10B98122", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  donePillText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#10B981" },
  playBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  /* Stats */
  activityHint: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  activityHintText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 18, borderWidth: 1, gap: 8 },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
});

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QAIDA_LESSONS } from "@/constants/qaida";
import {
  AI_CHAT_SUGGESTED_QUESTIONS,
  LEARN_AI_QUICK_PROMPTS,
  LEARN_FEATURE_CARDS,
  LEARN_HERO,
  LEARN_QAIDA_SECTION,
  resolveLearnGradient,
} from "@/constants/learnHub";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useQaidaProgress } from "@/hooks/useQaidaProgress";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress, hifzSessions } = useApp();
  const {
    completedCount,
    totalLessons,
    isLessonComplete,
    isLessonUnlocked,
    unlockHint,
  } = useQaidaProgress();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const nextLessonId = useMemo(() => {
    for (const l of QAIDA_LESSONS) {
      if (isLessonUnlocked(l.id) && !isLessonComplete(l.id)) return l.id;
    }
    return undefined;
  }, [isLessonUnlocked, isLessonComplete]);

  const headerSubtitle = useMemo(() => {
    if (completedCount === 0) {
      return "Start with Qaida lesson 1, quick questions below, or open the scholar.";
    }
    if (completedCount >= totalLessons) {
      return "Qaida path complete — deepen with Quran, Hifz, and the scholar.";
    }
    return `${completedCount} of ${totalLessons} Qaida lessons done — tap your next lesson to continue.`;
  }, [completedCount, totalLessons]);

  const completedSurahs = Object.values(progress.surahs).filter((s) => s.completed).length;
  const startedSurahs = Object.values(progress.surahs).filter((s) => s.started).length;
  const totalMinutes = progress.totalMinutes;

  const practiceThisWeek = useMemo(() => {
    const cutoff = Date.now() - WEEK_MS;
    return hifzSessions.filter((s) => s.timestamp >= cutoff).length;
  }, [hifzSessions]);

  const stats = useMemo(
    () => [
      { icon: "mic" as const, val: String(hifzSessions.length), lbl: "Hifz logs", color: "#8B5CF6" },
      { icon: "clock" as const, val: String(totalMinutes), lbl: "Minutes", color: colors.primary },
      { icon: "check-circle" as const, val: String(completedSurahs), lbl: "Surahs done", color: "#C8972A" },
      { icon: "calendar" as const, val: String(practiceThisWeek), lbl: "This week", color: "#2563EB" },
    ],
    [hifzSessions.length, totalMinutes, completedSurahs, practiceThisWeek, colors.primary]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Learn</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{headerSubtitle}</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(LEARN_HERO.href);
            }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Open AI Islamic Scholar chat"
          >
            <LinearGradient
              colors={[...resolveLearnGradient(LEARN_HERO.gradient, colors.primary, colors.primaryLight)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroCard, { borderRadius: colors.radius }]}
            >
              <View style={styles.heroLeft}>
                <View style={styles.heroBadge}>
                  <Feather name="cpu" size={12} color="#8B5CF6" />
                  <Text style={styles.heroBadgeText}>{LEARN_HERO.badge}</Text>
                </View>
                <Text style={styles.heroTitle}>{LEARN_HERO.title}</Text>
                <Text style={styles.heroSub}>{LEARN_HERO.subtitle}</Text>
                <View style={styles.heroBtn}>
                  <Text style={styles.heroBtnText}>{LEARN_HERO.cta}</Text>
                  <Feather name="arrow-right" size={14} color="#8B5CF6" />
                </View>
              </View>
              <View style={styles.heroRight}>
                <View style={[styles.waveCircle, { width: 80, height: 80 }]}>
                  <Feather name="message-circle" size={36} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* <View style={styles.quickSection}>
            <Text style={[styles.quickSectionLabel, { color: colors.foreground }]}>Ask the scholar</Text>
            <Text style={[styles.quickSectionSub, { color: colors.mutedForeground }]}>
              Opens chat with your question ({AI_CHAT_SUGGESTED_QUESTIONS.length} suggestions in chat).
            </Text>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickChipsRow}
            >
              {LEARN_AI_QUICK_PROMPTS.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/ai-chat",
                      params: { prompt: encodeURIComponent(q) },
                    });
                  }}
                  activeOpacity={0.75}
                >
                  <Feather name="message-circle" size={14} color={colors.primary} />
                  <Text style={[styles.quickChipText, { color: colors.foreground }]} numberOfLines={3}>
                    {q}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View> */}

          <View style={styles.featureRow}>
            {LEARN_FEATURE_CARDS.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(card.href);
                }}
                activeOpacity={0.85}
                style={{ flex: 1 }}
                accessibilityRole="button"
                accessibilityLabel={card.a11yLabel}
              >
                <LinearGradient
                  colors={[...resolveLearnGradient(card.gradient, colors.primary, colors.primaryLight)]}
                  style={[styles.halfCard, { borderRadius: colors.radius }]}
                >
                  <Feather name={card.icon} size={28} color="#FFFFFF" />
                  <Text style={styles.halfTitle}>{card.title}</Text>
                  <Text style={styles.halfSub}>{card.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{LEARN_QAIDA_SECTION.title}</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(LEARN_QAIDA_SECTION.href);
                }}
              >
                <Text style={[styles.seeAll, { color: colors.primary }]}>{LEARN_QAIDA_SECTION.linkLabel}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.qaidaSummary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <View style={styles.qaidaSummaryTop}>
                <Text style={[styles.qaidaSummaryLabel, { color: colors.mutedForeground }]}>Your progress</Text>
                <Text style={[styles.qaidaSummaryVal, { color: colors.primary }]}>
                  {completedCount}/{totalLessons} lessons
                </Text>
              </View>
              <View style={[styles.qaidaTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.qaidaFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.min(100, totalLessons ? (completedCount / totalLessons) * 100 : 0)}%` as const,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.qaidaHint, { color: colors.mutedForeground }]}>
                {LEARN_QAIDA_SECTION.progressHint}
              </Text>
            </View>

            {QAIDA_LESSONS.map((lesson) => {
              const locked = !isLessonUnlocked(lesson.id);
              const done = isLessonComplete(lesson.id);
              const isNext = lesson.id === nextLessonId;
              const hint = unlockHint(lesson.id);

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonRow,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    locked && { opacity: 0.62 },
                    isNext && !done && !locked && { borderColor: colors.primary, borderWidth: 1.5 },
                  ]}
                  onPress={() => {
                    if (locked) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      return;
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/lesson/${lesson.id}` as const);
                  }}
                  activeOpacity={locked ? 1 : 0.72}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: locked }}
                  accessibilityLabel={
                    locked
                      ? `${lesson.title}, locked. ${hint ?? ""}`
                      : done
                        ? `${lesson.title}, completed`
                        : `${lesson.title}, open lesson`
                  }
                >
                  <View
                    style={[
                      styles.lessonNum,
                      {
                        backgroundColor: done
                          ? "#10B98122"
                          : locked
                            ? colors.muted
                            : colors.secondary,
                      },
                    ]}
                  >
                    {done ? (
                      <Feather name="check" size={16} color="#10B981" />
                    ) : locked ? (
                      <Feather name="lock" size={14} color={colors.mutedForeground} />
                    ) : (
                      <Text style={[styles.lessonNumText, { color: colors.primary }]}>{lesson.id}</Text>
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <View style={styles.lessonTitleRow}>
                      <Text
                        style={[
                          styles.lessonTitle,
                          { color: locked ? colors.mutedForeground : colors.foreground },
                        ]}
                      >
                        {lesson.title}
                      </Text>
                      {isNext && !done && !locked && (
                        <View style={[styles.nextPill, { backgroundColor: colors.primary + "18" }]}>
                          <Text style={[styles.nextPillText, { color: colors.primary }]}>Next</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.lessonSub, { color: colors.mutedForeground }]}>{lesson.subtitle}</Text>
                    {locked && hint ? (
                      <Text style={[styles.lessonLockHint, { color: colors.mutedForeground }]}>{hint}</Text>
                    ) : null}
                  </View>
                  {!locked && !done && (
                    <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
                      <Feather name="play" size={12} color="#FFFFFF" />
                    </View>
                  )}
                  {done && (
                    <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.statsTitle, { color: colors.foreground }]}>Your activity</Text>
            <Text style={[styles.statsHint, { color: colors.mutedForeground }]}>
              {startedSurahs > 0
                ? `${startedSurahs} surah${startedSurahs === 1 ? "" : "s"} in progress in the Quran tab`
                : "Open a surah in the Quran tab to track reading progress"}
            </Text>
            <View style={styles.statsGrid}>
              {stats.map((stat) => (
                <View key={stat.lbl} style={styles.statItem}>
                  <Feather name={stat.icon} size={20} color={stat.color} />
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{stat.val}</Text>
                  <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>{stat.lbl}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  content: { padding: 20, gap: 16 },
  quickSection: { gap: 8 },
  quickSectionLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  quickSectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  quickChipsRow: { flexDirection: "row", gap: 10, paddingVertical: 4, paddingRight: 4 },
  quickChip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    maxWidth: 220,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickChipText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 17 },
  heroCard: { padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", overflow: "hidden" },
  heroLeft: { flex: 1, gap: 10 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  heroBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#8B5CF6", letterSpacing: 1 },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  heroSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" },
  heroBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8B5CF6" },
  heroRight: { marginLeft: 16 },
  waveCircle: { borderRadius: 50, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  featureRow: { flexDirection: "row", gap: 12 },
  halfCard: { padding: 20, alignItems: "center", gap: 10 },
  halfTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  halfSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center" },
  section: { gap: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  lessonRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  lessonNum: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  lessonNumText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  lessonSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  startBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statsCard: { padding: 20, borderWidth: 1 },
  statsTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 6 },
  statsHint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 14 },
  statsGrid: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 6 },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  qaidaSummary: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  qaidaSummaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  qaidaSummaryLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  qaidaSummaryVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  qaidaTrack: { height: 6, borderRadius: 4, overflow: "hidden" },
  qaidaFill: { height: "100%", borderRadius: 4 },
  qaidaHint: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  lessonTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  nextPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  nextPillText: { fontSize: 10, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.4 },
  lessonLockHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4, lineHeight: 15 },
});

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QAIDA_LESSONS } from "@/constants/qaida";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress } = useApp();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const completedSurahs = Object.values(progress.surahs).filter(s => s.completed).length;
  const totalMinutes = progress.totalMinutes;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Learn</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Your personalized learning journey</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.push("/ai-chat" as any)} activeOpacity={0.85}>
            <LinearGradient
              colors={["#8B5CF6", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroCard, { borderRadius: colors.radius }]}
            >
              <View style={styles.heroLeft}>
                <View style={styles.heroBadge}>
                  <Feather name="cpu" size={12} color="#8B5CF6" />
                  <Text style={styles.heroBadgeText}>AI POWERED</Text>
                </View>
                <Text style={styles.heroTitle}>AI Islamic Scholar</Text>
                <Text style={styles.heroSub}>Ask any Islamic question — Quran, Hadith, Fiqh, history, Islamic ethics</Text>
                <View style={styles.heroBtn}>
                  <Text style={styles.heroBtnText}>Start Conversation</Text>
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

          <View style={styles.featureRow}>
            <TouchableOpacity onPress={() => router.push("/recitation" as any)} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={[styles.halfCard, { borderRadius: colors.radius }]}
              >
                <Feather name="mic" size={28} color="#FFFFFF" />
                <Text style={styles.halfTitle}>AI Recitation</Text>
                <Text style={styles.halfSub}>Tajweed feedback</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/memorize" as any)} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={["#C8972A", "#D4A840"]}
                style={[styles.halfCard, { borderRadius: colors.radius }]}
              >
                <Feather name="heart" size={28} color="#FFFFFF" />
                <Text style={styles.halfTitle}>Hifz Planner</Text>
                <Text style={styles.halfSub}>Memorize Quran</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Qaida Lessons</Text>
              <TouchableOpacity onPress={() => router.push("/qaida")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>

            {QAIDA_LESSONS.slice(0, 4).map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push("/qaida")}
                disabled={lesson.locked}
                activeOpacity={lesson.locked ? 1 : 0.7}
              >
                <View style={[
                  styles.lessonNum,
                  { backgroundColor: lesson.locked ? colors.muted : colors.secondary }
                ]}>
                  {lesson.locked
                    ? <Feather name="lock" size={14} color={colors.mutedForeground} />
                    : <Text style={[styles.lessonNumText, { color: colors.primary }]}>{lesson.id}</Text>
                  }
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, { color: lesson.locked ? colors.mutedForeground : colors.foreground }]}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.lessonSub, { color: colors.mutedForeground }]}>{lesson.subtitle}</Text>
                </View>
                {!lesson.locked && (
                  <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
                    <Feather name="play" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.statsTitle, { color: colors.foreground }]}>Learning Stats</Text>
            <View style={styles.statsGrid}>
              {[
                { icon: "mic" as const, val: "24", lbl: "Sessions", color: "#8B5CF6" },
                { icon: "clock" as const, val: String(totalMinutes), lbl: "Minutes", color: colors.primary },
                { icon: "check-circle" as const, val: String(completedSurahs + 12), lbl: "Surahs", color: "#C8972A" },
                { icon: "trending-up" as const, val: "+5%", lbl: "This Week", color: "#2563EB" },
              ].map(stat => (
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
  statsTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 16 },
  statsGrid: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 6 },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
});

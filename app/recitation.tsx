import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FATIHA_AYAHS } from "@/constants/quranData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type RecordingState = "idle" | "recording" | "processing" | "result";

const FEEDBACK_COLORS: Record<string, string> = {
  correct: "#22C55E",
  intermediate: "#F59E0B",
  wrong: "#EF4444",
};

const MOCK_FEEDBACK = [
  { word: "بِسْمِ", status: "correct" as const },
  { word: "اللَّهِ", status: "correct" as const },
  { word: "الرَّحْمَٰنِ", status: "intermediate" as const },
  { word: "الرَّحِيمِ", status: "wrong" as const },
];

export default function RecitationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addXP } = useApp();
  const [state, setState] = useState<RecordingState>("idle");
  const [score, setScore] = useState(0);
  const [currentAyah, setCurrentAyah] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0.3))).current;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (state === "recording") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      waveAnims.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 0.9, duration: 300 + i * 80, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 300 + i * 80, useNativeDriver: true }),
          ])
        ).start();
      });
    } else {
      pulseAnim.setValue(1);
      waveAnims.forEach(a => a.setValue(0.3));
    }
  }, [state]);

  const handleRecord = async () => {
    if (state === "idle") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setState("recording");
    } else if (state === "recording") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setState("processing");
      setTimeout(() => {
        const s = Math.floor(Math.random() * 20) + 75;
        setScore(s);
        setState("result");
        if (s >= 85) addXP(15);
        else addXP(5);
      }, 2000);
    }
  };

  const handleRetry = () => {
    setState("idle");
    setScore(0);
  };

  const handleNext = () => {
    setCurrentAyah(p => (p + 1) % FATIHA_AYAHS.length);
    setState("idle");
    setScore(0);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>AI Recitation</Text>
        <View style={[styles.aiBadge, { backgroundColor: "#8B5CF6" + "20" }]}>
          <Feather name="cpu" size={12} color="#8B5CF6" />
          <Text style={[styles.aiBadgeText, { color: "#8B5CF6" }]}>AI</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Surah selector */}
        <View style={[styles.surahPill, { backgroundColor: colors.secondary, alignSelf: "center", marginTop: 20 }]}>
          <Text style={[styles.surahPillText, { color: colors.primary }]}>Al-Fatiha • Ayah {currentAyah + 1}/{FATIHA_AYAHS.length}</Text>
        </View>

        {/* Arabic Ayah */}
        <View style={[styles.ayahBox, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 16 }]}>
          <Text style={[styles.ayahArabic, { color: colors.foreground }]}>
            {FATIHA_AYAHS[currentAyah].arabic}
          </Text>
          <Text style={[styles.ayahTranslation, { color: colors.mutedForeground }]}>
            {FATIHA_AYAHS[currentAyah].translation}
          </Text>
        </View>

        {/* Result feedback */}
        {state === "result" && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 16 }]}>
            <View style={styles.scoreRow}>
              <View style={[styles.scoreCircle, { borderColor: score >= 85 ? "#22C55E" : score >= 70 ? "#F59E0B" : "#EF4444" }]}>
                <Text style={[styles.scoreNum, { color: colors.foreground }]}>{score}</Text>
                <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>/ 100</Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={[styles.scoreTitle, { color: colors.foreground }]}>
                  {score >= 85 ? "Excellent!" : score >= 70 ? "Good job!" : "Keep practicing"}
                </Text>
                <Text style={[styles.scoreSub, { color: colors.mutedForeground }]}>
                  {score >= 85 ? "Your recitation is very accurate" : "Some Tajweed corrections needed"}
                </Text>
              </View>
            </View>

            {/* Word analysis */}
            <View style={styles.wordRow}>
              {MOCK_FEEDBACK.map((w, i) => (
                <View key={i} style={[styles.wordChip, { backgroundColor: FEEDBACK_COLORS[w.status] + "20", borderColor: FEEDBACK_COLORS[w.status] + "50" }]}>
                  <Text style={[styles.wordText, { color: FEEDBACK_COLORS[w.status] }]}>{w.word}</Text>
                </View>
              ))}
            </View>

            <View style={styles.legend}>
              {Object.entries(FEEDBACK_COLORS).map(([key, color]) => (
                <View key={key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{key}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recording UI */}
        <View style={styles.recordSection}>
          {/* Waveform */}
          <View style={styles.waveform}>
            {waveAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    backgroundColor: state === "recording" ? "#8B5CF6" : colors.border,
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>

          {/* Mic button */}
          <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity onPress={handleRecord} activeOpacity={0.85}>
              {state === "idle" || state === "result" ? (
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  style={styles.micBtn}
                >
                  <Feather name="mic" size={32} color="#FFFFFF" />
                </LinearGradient>
              ) : state === "recording" ? (
                <LinearGradient colors={["#EF4444", "#DC2626"]} style={styles.micBtn}>
                  <Feather name="square" size={28} color="#FFFFFF" />
                </LinearGradient>
              ) : (
                <LinearGradient colors={["#6B7280", "#4B5563"]} style={styles.micBtn}>
                  <Feather name="loader" size={28} color="#FFFFFF" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.recordHint, { color: colors.mutedForeground }]}>
            {state === "idle" ? "Tap to start reciting" :
             state === "recording" ? "Reciting... Tap to stop" :
             state === "processing" ? "Analyzing your recitation..." :
             ""}
          </Text>

          {state === "result" && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={handleRetry}>
                <Feather name="refresh-cw" size={16} color={colors.foreground} />
                <Text style={[styles.actionText, { color: colors.foreground }]}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleNext}>
                <Text style={[styles.actionText, { color: "#FFFFFF" }]}>Next Ayah</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tips */}
        {state === "idle" && (
          <View style={[styles.tipsCard, { backgroundColor: colors.secondary, marginHorizontal: 20, marginBottom: 30 }]}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.tipsText, { color: colors.primary }]}>
              Speak clearly and at a natural pace. AI will analyze your Tajweed and provide feedback.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  aiBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  surahPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  surahPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  ayahBox: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 12 },
  ayahArabic: { fontSize: 26, textAlign: "right", lineHeight: 46, fontWeight: "400", writingDirection: "rtl" },
  ayahTranslation: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
  resultCard: { padding: 18, borderRadius: 16, borderWidth: 1, gap: 16 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  scoreNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 11 },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  scoreSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  wordRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  wordChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  wordText: { fontSize: 16, fontWeight: "400" },
  legend: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "capitalize" },
  recordSection: { alignItems: "center", paddingVertical: 36, gap: 20 },
  waveform: { flexDirection: "row", alignItems: "center", gap: 4, height: 50 },
  waveBar: { width: 4, height: 36, borderRadius: 2 },
  micBtn: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  recordHint: { fontSize: 14, fontFamily: "Inter_400Regular" },
  actionRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  actionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tipsCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, marginBottom: 0 },
  tipsText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});

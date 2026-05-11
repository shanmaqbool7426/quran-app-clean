import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const DHIKR_LIST = [
  { arabic: "سُبْحَانَ اللَّهِ", transliteration: "Subhan Allah", translation: "Glory be to Allah", target: 33 },
  { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "All praise to Allah", target: 33 },
  { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah is the Greatest", target: 34 },
  { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", translation: "There is no god but Allah", target: 100 },
  { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", translation: "I seek forgiveness from Allah", target: 100 },
];

export default function TasbeehScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasbeehCount, incrementTasbeeh, resetTasbeeh } = useApp();
  const [selectedDhikr, setSelectedDhikr] = React.useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const dhikr = DHIKR_LIST[selectedDhikr];
  const progress = Math.min(tasbeehCount / dhikr.target, 1);
  const cycles = Math.floor(tasbeehCount / dhikr.target);

  const handlePress = () => {
    incrementTasbeeh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if ((tasbeehCount + 1) % dhikr.target === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Tasbeeh Counter</Text>
        <TouchableOpacity onPress={resetTasbeeh} style={styles.resetBtn}>
          <Feather name="refresh-cw" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Dhikr selector */}
      <View style={[styles.dhikrList, { borderBottomColor: colors.border }]}>
        {DHIKR_LIST.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dhikrTab, selectedDhikr === i && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => { setSelectedDhikr(i); resetTasbeeh(); }}
          >
            <Text style={[styles.dhikrTabText, { color: selectedDhikr === i ? colors.primary : colors.mutedForeground }]}>
              {d.transliteration.split(" ")[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.main}>
        {/* Dhikr text */}
        <View style={[styles.dhikrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.dhikrArabic, { color: colors.foreground }]}>{dhikr.arabic}</Text>
          <Text style={[styles.dhikrTranslit, { color: colors.primary }]}>{dhikr.transliteration}</Text>
          <Text style={[styles.dhikrMeaning, { color: colors.mutedForeground }]}>{dhikr.translation}</Text>
        </View>

        {/* Circular progress + count */}
        <View style={styles.counterArea}>
          <View style={styles.circleWrapper}>
            <View style={[styles.circleTrack, { borderColor: colors.border }]}>
              <View style={[styles.circleInner, { backgroundColor: colors.background }]}>
                <Text style={[styles.countNum, { color: colors.foreground }]}>{tasbeehCount % dhikr.target}</Text>
                <Text style={[styles.countTarget, { color: colors.mutedForeground }]}>/ {dhikr.target}</Text>
                {cycles > 0 && (
                  <View style={[styles.cyclesBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.cyclesText, { color: colors.primary }]}>{cycles}x</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Big tap button */}
          <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.tapBtn}
              >
                <Feather name="plus" size={36} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>Tap to count</Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` as any }]} />
        </View>

        <Text style={[styles.totalCount, { color: colors.mutedForeground }]}>
          Total: {tasbeehCount} dhikr
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  resetBtn: { padding: 8 },
  dhikrList: { flexDirection: "row", borderBottomWidth: 1 },
  dhikrTab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  dhikrTabText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  main: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 24, gap: 24 },
  dhikrCard: { width: "100%", padding: 20, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 8 },
  dhikrArabic: { fontSize: 26, fontWeight: "400", lineHeight: 44, textAlign: "center", writingDirection: "rtl" },
  dhikrTranslit: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  dhikrMeaning: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  counterArea: { alignItems: "center", gap: 24, flex: 1 },
  circleWrapper: { position: "relative" },
  circleTrack: { width: 160, height: 160, borderRadius: 80, borderWidth: 6, alignItems: "center", justifyContent: "center" },
  circleInner: { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center", gap: 4 },
  countNum: { fontSize: 48, fontFamily: "Inter_700Bold" },
  countTarget: { fontSize: 14, fontFamily: "Inter_400Regular" },
  cyclesBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cyclesText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  tapBtn: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  tapHint: { fontSize: 13, fontFamily: "Inter_400Regular" },
  progressContainer: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  totalCount: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
});

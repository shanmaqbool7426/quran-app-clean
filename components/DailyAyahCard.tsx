import { Feather } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DAILY_AYAHS } from "@/constants/quranData";
import { useColors } from "@/hooks/useColors";
import { fetchRandomAyah } from "@/services/quranApi";

const todayIdx = new Date().getDate() % DAILY_AYAHS.length;

export default function DailyAyahCard() {
  const colors = useColors();
  const isDark = colors.background === "#0B1A2E";
  const [isPlaying, setIsPlaying] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dailyAyah"],
    queryFn: () => fetchRandomAyah(2),
    staleTime: 1000 * 60 * 60 * 12,
    retry: 2,
  });

  const fallback = DAILY_AYAHS[todayIdx];
  const arabic = data?.arabic ?? fallback?.arabic ?? "";
  const translation = data?.translation ?? fallback?.translation ?? "";
  const reference = data?.reference ?? fallback?.reference ?? "";
  const player = useAudioPlayer(data?.audioUrl || "");

  // Shimmer animation for loading
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isLoading]);

  // Entry animation
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryScale = useRef(new Animated.Value(0.97)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, { toValue: 1, duration: 700, delay: 300, useNativeDriver: true }),
      Animated.spring(entryScale, { toValue: 1, delay: 300, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, []);

  const handlePlay = async () => {
    if (!data?.audioUrl) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
    player.addListener("playbackStatusUpdate", (status) => {
      if (status.didJustFinish) setIsPlaying(false);
    });
  };

  return (
    <Animated.View style={{ opacity: entryOpacity, transform: [{ scale: entryScale }], marginHorizontal: 20 }}>
      <LinearGradient
        colors={isDark ? ["#0D3B2A","#0D5C3A","#1A3A5C"] : ["#0D5C3A","#1A8A5A","#2563EB"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative rings */}
        {[...Array(3)].map((_, i) => (
          <View key={i} style={[styles.ring, {
            width: 80 + i * 50, height: 80 + i * 50,
            borderRadius: (80 + i * 50) / 2,
            right: -20, top: -20,
            borderColor: `rgba(255,255,255,${0.07 - i * 0.02})`,
          }]} />
        ))}

        {/* Badge */}
        <View style={styles.badge}>
          <Feather name="star" size={10} color="#F59E0B" />
          <Text style={styles.badgeText}>AYAH OF THE DAY</Text>
        </View>

        {/* Loading shimmer */}
        {isLoading && (
          <Animated.View style={[styles.loadingRow, { opacity: shimmer }]}>
            <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" />
            <Text style={styles.loadingText}>Loading today's ayah...</Text>
          </Animated.View>
        )}

        {/* Arabic text */}
        <Text style={styles.arabic}>{arabic}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Translation */}
        <Text style={styles.translation}>"{translation}"</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.refTag}>
            <Feather name="book-open" size={11} color="rgba(255,255,255,0.9)" />
            <Text style={styles.refText}>{reference}</Text>
          </View>
          {data?.audioUrl && (
            <TouchableOpacity style={[styles.playBtn, { backgroundColor: isPlaying ? "#F59E0B44" : "rgba(255,255,255,0.2)" }]} onPress={handlePlay}>
              <Feather name={isPlaying ? "pause" : "volume-2"} size={14} color="#FFFFFF" />
              <Text style={styles.playText}>{isPlaying ? "Pause" : "Listen"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, padding: 22, gap: 14, overflow: "hidden" },
  ring: { position: "absolute", borderWidth: 1 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  badgeText: { color: "rgba(255,255,255,0.95)", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  arabic: { fontSize: 28, color: "#FFFFFF", textAlign: "right", lineHeight: 50, fontWeight: "400", writingDirection: "rtl" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  translation: { fontSize: 14, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_400Regular", lineHeight: 23, fontStyle: "italic" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  refTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  refText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  playBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  playText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_700Bold" },
});

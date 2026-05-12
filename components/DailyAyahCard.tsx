import { Feather } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { DAILY_AYAHS } from "@/constants/quranData";
import { useColors } from "@/hooks/useColors";
import { fetchRandomAyah } from "@/services/quranApi";

const todayIdx = new Date().getDate() % DAILY_AYAHS.length;

export default function DailyAyahCard() {
  const colors = useColors();
  const [isPlaying, setIsPlaying] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dailyAyah"],
    queryFn: () => fetchRandomAyah(2),
    staleTime: 1000 * 60 * 60 * 12,
    retry: 2,
  });

  const fallback = DAILY_AYAHS[todayIdx];
  const arabic = data?.arabic ?? fallback.arabic;
  const translation = data?.translation ?? fallback.translation;
  const reference = data?.reference ?? fallback.reference;
  const player = useAudioPlayer(data?.audioUrl || "");

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

    // Listen for completion
    player.addListener("playbackStatusUpdate", (status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    });
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: colors.radius }]}
    >
      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" />
          <Text style={styles.loadingText}>Loading today's ayah...</Text>
        </View>
      )}

      <Text style={styles.arabic}>{arabic}</Text>
      <View style={styles.divider} />
      <Text style={styles.translation}>{translation}</Text>

      <View style={styles.footer}>
        <View style={[styles.refTag, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="book-open" size={12} color="rgba(255,255,255,0.9)" />
          <Text style={styles.refText}>{reference}</Text>
        </View>
        {data?.audioUrl && (
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            onPress={handlePlay}
          >
            <Feather name={isPlaying ? "pause" : "volume-2"} size={15} color="#FFFFFF" />
            <Text style={styles.playText}>{isPlaying ? "Pause" : "Listen"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, padding: 22, gap: 14 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  arabic: { fontSize: 26, color: "#FFFFFF", textAlign: "right", lineHeight: 46, fontWeight: "400", writingDirection: "rtl" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  translation: { fontSize: 14, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_400Regular", lineHeight: 22, fontStyle: "italic" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  refTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  refText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontFamily: "Inter_500Medium" },
  playBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  playText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
});

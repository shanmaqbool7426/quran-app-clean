import { Feather } from "@expo/vector-icons";
import { createAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { fetchWordByWord, WordByWord } from "@/services/quranApi";

// ── Module-level audio singleton so only one word plays at a time ──────────────
let _nativePlayer: any = null;
let _webAudio: HTMLAudioElement | null = null;
let _playingUrl = "";
let _stopCurrentCallback: (() => void) | null = null;

async function stopCurrentWordAudio() {
  if (_stopCurrentCallback) {
    _stopCurrentCallback();
    _stopCurrentCallback = null;
  }
  if (Platform.OS === "web") {
    if (_webAudio) { _webAudio.pause(); _webAudio.src = ""; _webAudio = null; }
  } else {
    if (_nativePlayer) {
      try { 
        _nativePlayer.pause();
      } catch {}
      _nativePlayer = null;
    }
  }
  _playingUrl = "";
}

async function playWordAudio(
  url: string,
  onStart: () => void,
  onStop: () => void,
): Promise<void> {
  if (!url) return;

  if (_playingUrl === url) {
    await stopCurrentWordAudio();
    onStop();
    return;
  }

  await stopCurrentWordAudio();

  _playingUrl = url;
  _stopCurrentCallback = onStop;
  onStart();

  if (Platform.OS === "web") {
    try {
      const audio = new (window as any).Audio(url) as HTMLAudioElement;
      _webAudio = audio;
      audio.addEventListener("ended", () => { _playingUrl = ""; _webAudio = null; _stopCurrentCallback = null; onStop(); });
      audio.addEventListener("error", () => { _playingUrl = ""; _webAudio = null; _stopCurrentCallback = null; onStop(); });
      await audio.play();
    } catch { onStop(); }
  } else {
    try {
      _nativePlayer = createAudioPlayer(url);
      _nativePlayer.play();
      _nativePlayer.addListener("playbackStatusUpdate", (status: any) => {
        if (status.didJustFinish) {
          _playingUrl = "";
          _nativePlayer = null;
          _stopCurrentCallback = null;
          onStop();
        }
      });
    } catch { onStop(); }
  }
}

// ── WordChip ────────────────────────────────────────────────────────────────────
interface WordChipProps {
  word: WordByWord;
  isActive: boolean;
  isEven: boolean;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  fontSize: number;
}

function WordChip({ word, isActive, isEven, colors, fontSize }: WordChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const tapScaleAnim = useRef(new Animated.Value(1)).current;
  const [isPlayingWord, setIsPlayingWord] = useState(false);

  // All animations use JS driver: `glowAnim` drives shadowOpacity (not supported on native
  // driver). Mixing native + JS drivers on the same Animated.View crashes RN.
  const useAnimDriver = false;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.06, duration: 420, useNativeDriver: useAnimDriver }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 420, useNativeDriver: useAnimDriver }),
        ])
      ).start();
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: useAnimDriver }).start();
    } else {
      scaleAnim.stopAnimation();
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: useAnimDriver }),
        Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: useAnimDriver }),
      ]).start();
    }
  }, [isActive]);

  const handleTap = async () => {
    if (!word.audioUrl) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(tapScaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: false }),
      Animated.timing(tapScaleAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
    ]).start();
    await playWordAudio(
      word.audioUrl,
      () => setIsPlayingWord(true),
      () => setIsPlayingWord(false),
    );
  };

  const isPlayingState = isPlayingWord;
  const chipBg = isPlayingState
    ? "#10B981"
    : isActive
    ? colors.primary
    : isEven
    ? colors.secondary
    : colors.muted;

  const arabicColor = isPlayingState || isActive ? "#FFFFFF" : colors.primary;
  const translitColor = isPlayingState || isActive ? "rgba(255,255,255,0.75)" : colors.mutedForeground;
  const meaningColor = isPlayingState || isActive ? "#FFFFFF" : colors.foreground;

  return (
    <TouchableOpacity
      onPress={handleTap}
      activeOpacity={word.audioUrl ? 0.75 : 1}
      disabled={!word.audioUrl}
    >
      <Animated.View
        style={[
          styles.wordChip,
          {
            backgroundColor: chipBg,
            borderColor: isPlayingState
              ? "#10B981"
              : isActive
              ? colors.primary
              : colors.border,
            transform: [{ scale: scaleAnim }, { scale: tapScaleAnim }],
            shadowColor: isPlayingState ? "#10B981" : colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowAnim as any,
            shadowRadius: 8,
            elevation: isActive || isPlayingState ? 6 : 0,
          },
        ]}
      >
        {/* Speaker icon shown when playing or audio available */}
        {(isPlayingState || word.audioUrl) && (
          <View style={styles.speakerRow}>
            {isPlayingState ? (
              <View style={styles.playingDot}>
                <View style={[styles.dot, { backgroundColor: "#FFFFFF" }]} />
                <View style={[styles.dot, { backgroundColor: "#FFFFFF", height: 8 }]} />
                <View style={[styles.dot, { backgroundColor: "#FFFFFF" }]} />
              </View>
            ) : (
              <Feather
                name="volume-2"
                size={9}
                color={isActive ? "rgba(255,255,255,0.6)" : colors.mutedForeground + "99"}
              />
            )}
          </View>
        )}

        <Text
          style={[styles.arabic, { color: arabicColor, fontSize: Math.min(fontSize, 26) }]}
        >
          {word.word}
        </Text>

        <View style={[styles.divider, { backgroundColor: isPlayingState || isActive ? "rgba(255,255,255,0.3)" : colors.border }]} />

        {!!word.transliteration && (
          <Text style={[styles.translit, { color: translitColor }]} numberOfLines={1}>
            {word.transliteration}
          </Text>
        )}

        {!!word.translation && (
          <Text style={[styles.meaning, { color: meaningColor }]} numberOfLines={2}>
            {word.translation}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── WordByWordView ──────────────────────────────────────────────────────────────
interface Props {
  surahId: number;
  ayahNumber: number;
  fontSize?: number;
  playbackProgress?: number;
  isPlaying?: boolean;
}

export default function WordByWordView({
  surahId,
  ayahNumber,
  fontSize = 24,
  playbackProgress = 0,
  isPlaying = false,
}: Props) {
  const colors = useColors();
  const [words, setWords] = useState<WordByWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setWords([]);

    fetchWordByWord(surahId, ayahNumber).then((result) => {
      if (cancelled) return;
      if (result.length === 0) setError(true);
      else setWords(result);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [surahId, ayahNumber]);

  const activeWordIndex = isPlaying && words.length > 0
    ? Math.min(Math.floor(playbackProgress * words.length), words.length - 1)
    : -1;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading word analysis...
        </Text>
      </View>
    );
  }

  if (error || words.length === 0) {
    return (
      <View style={[styles.errorBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Word-by-word data unavailable for this ayah
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Active word callout strip */}
      {isPlaying && activeWordIndex >= 0 && words[activeWordIndex] && (
        <View style={[styles.activeStrip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.activeArabic, { color: colors.primary }]}>
            {words[activeWordIndex]!.word}
          </Text>
          {!!words[activeWordIndex]!.transliteration && (
            <Text style={[styles.activeTranslit, { color: colors.mutedForeground }]}>
              {words[activeWordIndex]!.transliteration}
            </Text>
          )}
          <View style={[styles.activeDiv, { backgroundColor: colors.border }]} />
          {!!words[activeWordIndex]!.translation && (
            <Text style={[styles.activeMeaning, { color: colors.foreground }]}>
              {words[activeWordIndex]!.translation}
            </Text>
          )}
          <Text style={[styles.activeCounter, { color: colors.mutedForeground }]}>
            {activeWordIndex + 1}/{words.length}
          </Text>
        </View>
      )}

      {/* RTL wrapped word chips */}
      <View style={styles.wordsRow}>
        {words.map((word, i) => (
          <WordChip
            key={i}
            word={word}
            isActive={i === activeWordIndex}
            isEven={i % 2 === 0}
            colors={colors}
            fontSize={fontSize}
          />
        ))}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { borderTopColor: colors.border }]}>
        <View style={styles.legendItem}>
          <Feather name="volume-2" size={10} color={colors.mutedForeground} />
          <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
            Tap any word to hear pronunciation
          </Text>
        </View>
        <Text style={[styles.wordCount, { color: colors.mutedForeground }]}>
          {words.length} words
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  errorBox: { padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  activeStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    flexWrap: "wrap",
  },
  activeDot: { width: 7, height: 7, borderRadius: 4 },
  activeArabic: { fontSize: 20, fontWeight: "400", lineHeight: 30 },
  activeTranslit: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  activeDiv: { width: 1, height: 16 },
  activeMeaning: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  activeCounter: { fontSize: 11, fontFamily: "Inter_500Medium" },
  wordsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
  },
  wordChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
    minWidth: 72,
    maxWidth: 110,
  },
  speakerRow: {
    position: "absolute",
    top: 5,
    right: 6,
  },
  playingDot: {
    flexDirection: "row",
    gap: 1.5,
    alignItems: "flex-end",
    height: 10,
  },
  dot: {
    width: 2.5,
    height: 6,
    borderRadius: 1.5,
    backgroundColor: "#FFFFFF",
  },
  arabic: {
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 36,
    writingDirection: "rtl",
  },
  divider: { width: "100%", height: 1 },
  translit: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 14,
  },
  meaning: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 14,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  wordCount: { fontSize: 11, fontFamily: "Inter_500Medium" },
});

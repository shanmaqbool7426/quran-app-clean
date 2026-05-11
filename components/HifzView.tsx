import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import HifzQuiz from "@/components/HifzQuiz";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export type HifzDifficulty = "easy" | "medium" | "hard";

interface Props {
  arabic: string;
  translation: string;
  ayahNumber: number;
  surahId: number;
  surahName: string;
  fontSize?: number;
  difficulty: HifzDifficulty;
  showTranslation?: boolean;
}

function getInitiallyHidden(wordCount: number, difficulty: HifzDifficulty): Set<number> {
  const hidden = new Set<number>();
  if (difficulty === "easy") {
    for (let i = 1; i < wordCount - 1; i += 2) hidden.add(i);
  } else if (difficulty === "medium") {
    for (let i = 0; i < wordCount; i++) {
      if (i % 3 !== 0) hidden.add(i);
    }
  } else {
    for (let i = 0; i < wordCount; i++) hidden.add(i);
  }
  return hidden;
}

function HifzWord({
  word,
  index,
  isHidden,
  onReveal,
  fontSize,
  colors,
}: {
  word: string;
  index: number;
  isHidden: boolean;
  onReveal: (i: number) => void;
  fontSize: number;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const revealAnim = useRef(new Animated.Value(isHidden ? 0 : 1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const prevHidden = useRef(isHidden);

  useEffect(() => {
    if (prevHidden.current && !isHidden) {
      Animated.sequence([
        Animated.spring(bounceAnim, { toValue: 1.15, useNativeDriver: true, speed: 30, bounciness: 10 }),
        Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4 }),
      ]).start();
      Animated.timing(revealAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
    prevHidden.current = isHidden;
  }, [isHidden]);

  const handlePress = () => {
    if (!isHidden) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReveal(index);
  };

  const wordFontSize = Math.min(fontSize, 26);

  if (isHidden) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.hiddenWord,
          {
            borderColor: colors.primary + "50",
            backgroundColor: colors.primary + "10",
            minWidth: wordFontSize * 1.6,
            height: wordFontSize + 16,
          },
        ]}
      >
        <View style={styles.hiddenDots}>
          <View style={[styles.dot, { backgroundColor: colors.primary + "60" }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary + "60" }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary + "60" }]} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: bounceAnim }], opacity: revealAnim }}>
      <View style={[styles.revealedWord, { backgroundColor: colors.secondary, borderColor: colors.primary + "30" }]}>
        <Text style={[styles.arabicWord, { color: colors.primary, fontSize: wordFontSize }]}>
          {word}
        </Text>
      </View>
    </Animated.View>
  );
}

const DIFFICULTY_LABELS: Record<HifzDifficulty, { label: string; desc: string; color: string }> = {
  easy: { label: "Easy", desc: "Every other word", color: "#10B981" },
  medium: { label: "Medium", desc: "Most words hidden", color: "#F59E0B" },
  hard: { label: "Hard", desc: "All words hidden", color: "#EF4444" },
};

export default function HifzView({
  arabic,
  translation,
  ayahNumber,
  surahId,
  surahName,
  fontSize = 24,
  difficulty,
  showTranslation = true,
}: Props) {
  const colors = useColors();
  const { recordHifzSession } = useApp();

  const words = arabic.trim().split(/\s+/).filter(Boolean);
  const [hiddenWords, setHiddenWords] = useState<Set<number>>(
    () => getInitiallyHidden(words.length, difficulty)
  );
  const [celebrated, setCelebrated] = useState(false);
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const sessionRecorded = useRef(false);
  const [quizVisible, setQuizVisible] = useState(false);

  useEffect(() => {
    setHiddenWords(getInitiallyHidden(words.length, difficulty));
    setCelebrated(false);
    celebrateAnim.setValue(0);
    sessionRecorded.current = false;
  }, [difficulty, arabic]);

  const revealedCount = words.length - hiddenWords.size;
  const progress = words.length > 0 ? revealedCount / words.length : 1;
  const allRevealed = hiddenWords.size === 0;

  useEffect(() => {
    if (allRevealed && !celebrated) {
      setCelebrated(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(celebrateAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(celebrateAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();

      if (!sessionRecorded.current) {
        sessionRecorded.current = true;
        recordHifzSession(surahId, surahName, ayahNumber);
      }
    }
  }, [allRevealed]);

  const handleReveal = (index: number) => {
    setHiddenWords((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleRevealAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHiddenWords(new Set());
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setHiddenWords(getInitiallyHidden(words.length, difficulty));
    setCelebrated(false);
    celebrateAnim.setValue(0);
    sessionRecorded.current = false;
  };

  const diffInfo = DIFFICULTY_LABELS[difficulty];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.diffBadge, { backgroundColor: diffInfo.color + "18", borderColor: diffInfo.color + "40" }]}>
          <View style={[styles.diffDot, { backgroundColor: diffInfo.color }]} />
          <Text style={[styles.diffLabel, { color: diffInfo.color }]}>{diffInfo.label}</Text>
        </View>
        <Text style={[styles.stats, { color: colors.mutedForeground }]}>
          {revealedCount}/{words.length} revealed
        </Text>
        <View style={styles.headerActions}>
          {!allRevealed && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={handleRevealAll}
            >
              <Feather name="eye" size={12} color={colors.mutedForeground} />
              <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Show all</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={handleReset}
          >
            <Feather name="refresh-cw" size={12} color={colors.mutedForeground} />
            <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: diffInfo.color, width: `${Math.round(progress * 100)}%` as any },
          ]}
        />
      </View>

      {allRevealed && (
        <Animated.View
          style={[
            styles.celebrationBanner,
            {
              backgroundColor: "#10B98115",
              borderColor: "#10B98140",
              opacity: celebrated
                ? celebrateAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] })
                : 1,
            },
          ]}
        >
          <Text style={styles.celebrationEmoji}>🌟</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.celebrationTitle, { color: "#10B981" }]}>
              Excellent! Ayah memorized
            </Text>
            <Text style={[styles.celebrationSub, { color: colors.mutedForeground }]}>
              Recorded in your Hifz progress
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.quizBtn, { backgroundColor: "#F59E0B" }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setQuizVisible(true);
            }}
          >
            <Text style={styles.quizBtnEmoji}>🧠</Text>
            <Text style={styles.quizBtnText}>Test Recall</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.wordsContainer}>
        {words.map((word, i) => (
          <HifzWord
            key={i}
            word={word}
            index={i}
            isHidden={hiddenWords.has(i)}
            onReveal={handleReveal}
            fontSize={fontSize}
            colors={colors}
          />
        ))}
      </View>

      {hiddenWords.size > 0 && (
        <View style={[styles.hint, { borderColor: colors.border }]}>
          <Feather name="info" size={11} color={colors.mutedForeground} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Tap a hidden word to reveal it
          </Text>
        </View>
      )}

      {showTranslation && (
        <View style={[styles.translationBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text style={[styles.translationText, { color: colors.mutedForeground }]}>
            {translation}
          </Text>
        </View>
      )}

      <HifzQuiz
        visible={quizVisible}
        onClose={() => setQuizVisible(false)}
        words={words}
        translation={translation}
        surahName={surahName}
        ayahNumber={ayahNumber}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  diffBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffLabel: { fontSize: 11, fontFamily: "Inter_700Bold" },
  stats: { fontSize: 11, fontFamily: "Inter_500Medium", flex: 1 },
  headerActions: { flexDirection: "row", gap: 6 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  progressTrack: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  celebrationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  celebrationEmoji: { fontSize: 22 },
  celebrationTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  celebrationSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  quizBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  quizBtnEmoji: { fontSize: 13 },
  quizBtnText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Inter_700Bold" },
  wordsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
    paddingVertical: 6,
  },
  hiddenWord: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  hiddenDots: { flexDirection: "row", gap: 3 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  revealedWord: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  arabicWord: { fontWeight: "400", lineHeight: 36 },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  hintText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  translationBox: { padding: 12, borderRadius: 10, borderWidth: 1 },
  translationText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
});

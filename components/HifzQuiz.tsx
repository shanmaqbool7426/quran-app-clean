import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  words: string[];
  translation: string;
  surahName: string;
  ayahNumber: number;
}

function shuffleWithIdx(arr: string[]): Array<{ word: string; origIdx: number }> {
  const indexed = arr.map((word, origIdx) => ({ word, origIdx }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j]!, indexed[i]!];
  }
  return indexed;
}

function WordSlot({
  word,
  filled,
  isNext,
  colors,
}: {
  word?: string;
  filled: boolean;
  isNext: boolean;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const prevFilled = useRef(filled);

  useEffect(() => {
    if (!prevFilled.current && filled) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 12 }),
      ]).start();
    } else if (!filled) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.7);
    }
    prevFilled.current = filled;
  }, [filled]);

  if (filled && word) {
    return (
      <Animated.View
        style={[
          styles.slotFilled,
          { backgroundColor: "#10B98115", borderColor: "#10B981", transform: [{ scale: scaleAnim }], opacity: fadeAnim },
        ]}
      >
        <Text style={[styles.slotWord, { color: "#10B981" }]}>{word}</Text>
      </Animated.View>
    );
  }

  return (
    <View
      style={[
        styles.slotEmpty,
        {
          borderColor: isNext ? colors.primary : colors.border,
          backgroundColor: isNext ? colors.primary + "08" : colors.muted,
        },
      ]}
    >
      {isNext && <View style={[styles.slotCursor, { backgroundColor: colors.primary }]} />}
    </View>
  );
}

function WordPoolChip({
  word,
  used,
  isWrong,
  onTap,
  colors,
}: {
  word: string;
  used: boolean;
  isWrong: boolean;
  onTap: () => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isWrong) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]).start();
    }
  }, [isWrong]);

  const bg = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [used ? colors.muted : colors.secondary, "#FEE2E2"] });
  const borderCol = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [used ? colors.border : colors.primary + "40", "#FCA5A5"] });

  return (
    <TouchableOpacity onPress={used ? undefined : onTap} disabled={used} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.poolChip,
          {
            backgroundColor: bg,
            borderColor: borderCol,
            opacity: used ? 0.25 : 1,
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        <Text style={[styles.poolChipText, { color: used ? colors.mutedForeground : colors.primary }]}>
          {word}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HifzQuiz({ visible, onClose, words, translation, surahName, ayahNumber }: Props) {
  const colors = useColors();
  const [shuffled, setShuffled] = useState<Array<{ word: string; origIdx: number }>>([]);
  const [placedCount, setPlacedCount] = useState(0);
  const [wrongShuffledIdx, setWrongShuffledIdx] = useState<number | null>(null);
  const celebrateAnim = useRef(new Animated.Value(0)).current;

  const completed = placedCount === words.length && words.length > 0;

  const reset = () => {
    setShuffled(shuffleWithIdx(words));
    setPlacedCount(0);
    setWrongShuffledIdx(null);
    celebrateAnim.setValue(0);
  };

  useEffect(() => {
    if (visible) reset();
  }, [visible, words.join(",")]);

  useEffect(() => {
    if (completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(celebrateAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(celebrateAnim, { toValue: 0.7, duration: 300, useNativeDriver: true }),
        Animated.timing(celebrateAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [completed]);

  const handleTap = (shuffledIdx: number) => {
    const item = shuffled[shuffledIdx];
    if (!item) return;
    const expectedOrigIdx = placedCount;
    if (item.origIdx === expectedOrigIdx) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPlacedCount(prev => prev + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrongShuffledIdx(shuffledIdx);
      setTimeout(() => setWrongShuffledIdx(null), 700);
    }
  };

  const usedOrigIdxs = new Set(
    shuffled.slice(0, placedCount < shuffled.length
      ? shuffled.findIndex((s, i) => {
          const placed = shuffled.filter((_, j) => j < shuffled.length).slice(0, placedCount).map(x => x.origIdx);
          return placed.includes(s.origIdx);
        })
      : shuffled.length
    ).map(s => s.origIdx)
  );

  const isUsed = (shuffledIdx: number): boolean => {
    const item = shuffled[shuffledIdx];
    if (!item) return false;
    const placedOrigIdxs = new Set<number>();
    let count = 0;
    for (const s of shuffled) {
      if (count >= placedCount) break;
      if (s.origIdx === item.origIdx) {
        if (item.origIdx < placedCount) {
          return true;
        }
      }
      count++;
    }
    return item.origIdx < placedCount;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.headerRow}>
            <View style={[styles.quizBadge, { backgroundColor: "#F59E0B15", borderColor: "#F59E0B40" }]}>
              <Text style={styles.quizBadgeEmoji}>🧠</Text>
              <Text style={[styles.quizBadgeText, { color: "#F59E0B" }]}>Memory Test</Text>
            </View>
            <Text style={[styles.refText, { color: colors.mutedForeground }]}>
              {surahName} · Ayah {ayahNumber}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.translationBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="info" size={12} color={colors.mutedForeground} />
            <Text style={[styles.translationHint, { color: colors.mutedForeground }]}>
              {translation}
            </Text>
          </View>

          {completed ? (
            <Animated.View
              style={[
                styles.celebrationBox,
                { backgroundColor: "#10B98115", borderColor: "#10B98140", opacity: celebrateAnim },
              ]}
            >
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.celebrationTitle, { color: "#10B981" }]}>
                  Perfect Recall!
                </Text>
                <Text style={[styles.celebrationSub, { color: colors.mutedForeground }]}>
                  You reconstructed the ayah from memory
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.tryAgainBtn, { backgroundColor: "#10B981" }]}
                onPress={reset}
              >
                <Feather name="refresh-cw" size={14} color="#FFFFFF" />
                <Text style={styles.tryAgainText}>Again</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={[styles.progressRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                {placedCount} / {words.length} words placed
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${words.length > 0 ? (placedCount / words.length) * 100 : 0}%` as any,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Your answer (RTL order):
            </Text>

            <View style={styles.slotsContainer}>
              {words.map((word, origIdx) => (
                <WordSlot
                  key={origIdx}
                  word={word}
                  filled={origIdx < placedCount}
                  isNext={origIdx === placedCount}
                  colors={colors}
                />
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Tap words in the correct order:
            </Text>

            <View style={styles.poolContainer}>
              {shuffled.map((item, shuffledIdx) => (
                <WordPoolChip
                  key={shuffledIdx}
                  word={item.word}
                  used={isUsed(shuffledIdx)}
                  isWrong={wrongShuffledIdx === shuffledIdx}
                  onTap={() => handleTap(shuffledIdx)}
                  colors={colors}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.resetBtn, { borderColor: colors.border }]}
              onPress={reset}
            >
              <Feather name="refresh-cw" size={13} color={colors.mutedForeground} />
              <Text style={[styles.resetBtnText, { color: colors.mutedForeground }]}>
                Reshuffle
              </Text>
            </TouchableOpacity>

            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Tap words in the original Arabic order. Wrong taps shake red — don't worry, keep trying!
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%", minHeight: "70%" },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  quizBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  quizBadgeEmoji: { fontSize: 14 },
  quizBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  refText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
  closeBtn: { padding: 4 },
  translationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  translationHint: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
  celebrationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  celebrationEmoji: { fontSize: 28 },
  celebrationTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  celebrationSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tryAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  tryAgainText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  progressLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  slotsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-start",
    minHeight: 48,
  },
  slotFilled: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  slotWord: { fontSize: 18, fontWeight: "400", lineHeight: 28 },
  slotEmpty: {
    width: 48,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  slotCursor: { width: 2, height: 18, borderRadius: 1 },
  divider: { height: 1 },
  poolContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start",
    minHeight: 60,
  },
  poolChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 52,
  },
  poolChipText: { fontSize: 20, fontWeight: "400", lineHeight: 30 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
  },
  resetBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
});

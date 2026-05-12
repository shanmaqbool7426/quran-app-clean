import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ARABIC_ALPHABET, ArabicLetter, QAIDA_LESSONS } from "@/constants/qaida";
import { useColors } from "@/hooks/useColors";
import { useQaidaProgress } from "@/hooks/useQaidaProgress";

function speakArabic(text: string, name: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && (window as any).speechSynthesis) {
      const synth = (window as any).speechSynthesis as SpeechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      synth.speak(utterance);
    }
  } else {
    Speech.stop();
    Speech.speak(text, { language: "ar-SA", rate: 0.8 });
  }
}

function LetterDetailBar({ letter, colors }: { letter: ArabicLetter; colors: any }) {
  return (
    <View style={[styles.detailBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.detailBigLetter}>
        <Text style={styles.detailBigText}>{letter.letter}</Text>
      </LinearGradient>
      <View style={styles.detailInfo}>
        <View style={styles.detailNameRow}>
          <Text style={[styles.detailName, { color: colors.foreground }]}>{letter.name}</Text>
          <Text style={[styles.detailTranslit, { color: colors.primary }]}>/{letter.transliteration}/</Text>
        </View>
        <Text style={[styles.detailExample, { color: colors.mutedForeground }]}>
          {letter.example}  —  {letter.exampleMeaning}
        </Text>
        <View style={styles.formsRow}>
          {[
            { label: "Isolated", val: letter.isolated },
            { label: "Initial", val: letter.initial },
            { label: "Medial", val: letter.medial },
            { label: "Final", val: letter.final },
          ].map(f => (
            <View key={f.label} style={[styles.formItem, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.formText, { color: colors.primary }]}>{f.val}</Text>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.speakBtn, { backgroundColor: colors.primary }]}
        onPress={() => speakArabic(letter.letter, letter.name)}
      >
        <Feather name="volume-2" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

export default function QaidaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isLessonUnlocked, unlockHint } = useQaidaProgress();
  const [mode, setMode] = useState<"alphabet" | "lessons">("alphabet");
  const [selected, setSelected] = useState<string | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const selectedLetter = ARABIC_ALPHABET.find(l => l.id === selected);

  const handleLetterPress = (item: ArabicLetter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = selected === item.id ? null : item.id;
    setSelected(newSelected);
    if (newSelected) speakArabic(item.letter, item.name);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Arabic Qaida</Text>
        <TouchableOpacity
          style={[styles.soundBtn, { backgroundColor: colors.secondary }]}
          onPress={() => selectedLetter && speakArabic(selectedLetter.letter, selectedLetter.name)}
        >
          <Feather name="volume-2" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Mode switcher */}
      <View style={[styles.modeSwitcher, { backgroundColor: colors.muted, margin: 16, marginBottom: 0 }]}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "alphabet" && { backgroundColor: colors.primary }]}
          onPress={() => setMode("alphabet")}
        >
          <Text style={[styles.modeBtnText, { color: mode === "alphabet" ? "#FFFFFF" : colors.mutedForeground }]}>
            Alphabet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "lessons" && { backgroundColor: colors.primary }]}
          onPress={() => setMode("lessons")}
        >
          <Text style={[styles.modeBtnText, { color: mode === "lessons" ? "#FFFFFF" : colors.mutedForeground }]}>
            Lessons
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected letter detail */}
      {selected && selectedLetter && mode === "alphabet" && (
        <LetterDetailBar letter={selectedLetter} colors={colors} />
      )}

      {mode === "alphabet" ? (
        <FlatList
          key="qaida-alphabet"
          data={ARABIC_ALPHABET}
          keyExtractor={item => item.id}
          numColumns={4}
          contentContainerStyle={{
            padding: 12,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
            gap: 10,
          }}
          columnWrapperStyle={{ gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selected === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.letterCard,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleLetterPress(item)}
                activeOpacity={0.75}
              >
                <Text style={[styles.letterMain, { color: isSelected ? "#FFFFFF" : colors.foreground }]}>
                  {item.letter}
                </Text>
                <Text style={[styles.letterSub, { color: isSelected ? "rgba(255,255,255,0.85)" : colors.mutedForeground }]}>
                  {item.name}
                </Text>
                {isSelected && (
                  <View style={styles.playIndicator}>
                    <Feather name="volume-2" size={10} color="rgba(255,255,255,0.8)" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <FlatList
          key="qaida-lessons"
          data={QAIDA_LESSONS}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const locked = !isLessonUnlocked(item.id);
            const hint = unlockHint(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.lessonCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: locked ? 0.62 : 1,
                  },
                ]}
                onPress={() => {
                  if (locked) return;
                  router.push({ pathname: "/lesson/[id]", params: { id: item.id } });
                }}
                disabled={locked}
                activeOpacity={locked ? 1 : 0.75}
              >
                <View style={[styles.lessonNum, { backgroundColor: locked ? colors.muted : colors.secondary }]}>
                  {locked ? (
                    <Feather name="lock" size={14} color={colors.mutedForeground} />
                  ) : (
                    <Text style={[styles.lessonNumText, { color: colors.primary }]}>{item.id}</Text>
                  )}
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, { color: locked ? colors.mutedForeground : colors.foreground }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.lessonSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
                  {locked && hint ? (
                    <Text style={[styles.lessonLockHint, { color: colors.mutedForeground }]}>{hint}</Text>
                  ) : null}
                </View>
                {!locked && (
                  <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.startBtn}>
                    <Feather name="play" size={14} color="#FFFFFF" />
                  </LinearGradient>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  soundBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modeSwitcher: { flexDirection: "row", borderRadius: 12, padding: 4 },
  modeBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  modeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  detailBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 16,
  },
  detailBigLetter: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  detailBigText: { color: "#FFFFFF", fontSize: 28, fontWeight: "400" },
  detailInfo: { flex: 1, gap: 6 },
  detailNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  detailTranslit: { fontSize: 13, fontFamily: "Inter_400Regular" },
  detailExample: { fontSize: 13, fontFamily: "Inter_400Regular" },
  formsRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  formItem: { alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  formText: { fontSize: 16, fontWeight: "400" },
  formLabel: { fontSize: 9, fontFamily: "Inter_400Regular", marginTop: 2 },
  speakBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  letterCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    position: "relative",
  },
  letterMain: { fontSize: 28, fontWeight: "400" },
  letterSub: { fontSize: 10, fontFamily: "Inter_500Medium" },
  playIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  lessonCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  lessonNum: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  lessonNumText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  lessonSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  lessonLockHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4, lineHeight: 15 },
  startBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});

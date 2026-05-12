/**
 * Recitation Practice Screen
 * Records user's voice, sends to backend for Whisper transcription,
 * compares word-by-word against the reference Arabic, and returns a real score.
 *
 * Fallback: if backend STT is unavailable, shows a manual input mode so
 * the feature never hard-crashes.
 */
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FATIHA_AYAHS, IKHLAS_AYAHS } from "@/constants/quranData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Stage = "idle" | "recording" | "processing" | "result" | "manual";
type WordStatus = "correct" | "intermediate" | "wrong";

interface WordResult {
  word: string;
  heard: string;
  status: WordStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = "http://192.168.100.5:8080/api";

const COLOR: Record<WordStatus, string> = {
  correct:      "#22C55E",
  intermediate: "#F59E0B",
  wrong:        "#EF4444",
};

const SURAHS = [
  { label: "Al-Fatiha", ayahs: FATIHA_AYAHS },
  { label: "Al-Ikhlas",  ayahs: IKHLAS_AYAHS },
];

// ─────────────────────────────────────────────────────────────────────────────
// Arabic helpers (client-side, zero latency)
// ─────────────────────────────────────────────────────────────────────────────
function stripDiacritics(t: string) {
  return t
    .replace(/[\u064B-\u065F\u0670\u0610-\u061A]/g, "")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A")
    .replace(/\s+/g, " ").trim();
}

function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const pool = b.split("");
  let hits = 0;
  for (const ch of a.split("")) {
    const i = pool.indexOf(ch);
    if (i !== -1) { hits++; pool.splice(i, 1); }
  }
  return hits / Math.max(a.length, b.length);
}

function analyseRecitation(expectedArabic: string, transcript: string) {
  const refWords  = stripDiacritics(expectedArabic).split(" ").filter(Boolean);
  const gotWords  = stripDiacritics(transcript).split(" ").filter(Boolean);
  const origWords = expectedArabic.split(" ").filter(Boolean);

  let totalSim = 0;
  const words: WordResult[] = refWords.map((ref, i) => {
    const got = gotWords[i] ?? "";
    const sim = wordSimilarity(ref, got);
    totalSim += sim;
    return {
      word:   origWords[i] ?? ref,
      heard:  got,
      status: sim >= 0.82 ? "correct" : sim >= 0.45 ? "intermediate" : "wrong",
    };
  });

  const penalty = Math.max(0, gotWords.length - refWords.length) * 0.6;
  const score   = Math.max(0, Math.min(100,
    refWords.length ? Math.round(((totalSim - penalty) / refWords.length) * 100) : 0
  ));
  return { score, words };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function RecitationScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const { addXP } = useApp();

  const [stage,    setStage]    = useState<Stage>("idle");
  const [surahIdx, setSurahIdx] = useState(0);
  const [ayahIdx,  setAyahIdx]  = useState(0);
  const [score,    setScore]    = useState(0);
  const [words,    setWords]    = useState<WordResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [manual,   setManual]   = useState("");    // manual input text

  const recordingRef = useRef<Audio.Recording | null>(null);
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const waveAnims    = useRef(
    Array.from({ length: 9 }, () => new Animated.Value(0.2))
  ).current;

  const surah = SURAHS[surahIdx]!;
  const ayah  = surah.ayahs[ayahIdx]!;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // ── Animations ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage === "recording") {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.16, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
      ])).start();
      waveAnims.forEach((a, i) => Animated.loop(Animated.sequence([
        Animated.timing(a, { toValue: 0.9, duration: 240 + i * 50, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.1, duration: 240 + i * 50, useNativeDriver: true }),
      ])).start());
    } else {
      pulseAnim.stopAnimation(); pulseAnim.setValue(1);
      waveAnims.forEach(a => { a.stopAnimation(); a.setValue(0.2); });
    }
  }, [stage]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  function reset() {
    setStage("idle"); setScore(0); setWords([]);
    setErrorMsg(""); setManual("");
  }

  function nextAyah() {
    const next = ayahIdx + 1;
    if (next < surah.ayahs.length) setAyahIdx(next);
    else { setSurahIdx((surahIdx + 1) % SURAHS.length); setAyahIdx(0); }
    reset();
  }

  // ── Finish scoring ─────────────────────────────────────────────────────────
  function finish(transcript: string) {
    const { score: s, words: w } = analyseRecitation(ayah.arabic, transcript);
    setScore(s); setWords(w); setStage("result");
    if (s >= 85) addXP(20); else if (s >= 60) addXP(10); else addXP(3);
    Haptics.notificationAsync(
      s >= 85 ? Haptics.NotificationFeedbackType.Success
              : Haptics.NotificationFeedbackType.Warning
    );
  }

  // ── Manual submit ──────────────────────────────────────────────────────────
  function submitManual() {
    if (!manual.trim()) return;
    finish(manual.trim());
  }

  // ── Record start ───────────────────────────────────────────────────────────
  async function startRecording() {
    setErrorMsg("");
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Microphone permission denied. Please allow it in Settings.");
      return;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStage("recording");
    } catch {
      setErrorMsg("Could not start recording. Please try again.");
    }
  }

  // ── Record stop + backend STT ──────────────────────────────────────────────
  async function stopAndAnalyse() {
    const rec = recordingRef.current;
    if (!rec) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStage("processing");

    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = rec.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error("No audio URI");

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const ext      = uri.endsWith(".wav") ? "wav" : "m4a";
      const mimeType = ext === "wav" ? "audio/wav" : "audio/m4a";

      const res = await fetch(`${API_BASE}/ai/recitation`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ audioBase64: base64, mimeType, expectedArabic: ayah.arabic }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json() as { score: number; transcript: string; feedback: WordResult[] };

      // Use server result directly if available
      setScore(data.score);
      setWords(data.feedback ?? []);
      setStage("result");
      if (data.score >= 85) addXP(20); else if (data.score >= 60) addXP(10); else addXP(3);
      Haptics.notificationAsync(
        data.score >= 85 ? Haptics.NotificationFeedbackType.Success
                         : Haptics.NotificationFeedbackType.Warning
      );
    } catch (e) {
      // Backend STT failed — offer manual input as fallback
      recordingRef.current = null;
      setErrorMsg(
        "Voice recognition unavailable. Enter what you recited to get feedback:"
      );
      setStage("manual");
    }
  }

  const handleMic = () => {
    if (stage === "idle" || stage === "result") startRecording();
    else if (stage === "recording") stopAndAnalyse();
  };

  const scoreColor = score >= 85 ? COLOR.correct : score >= 60 ? COLOR.intermediate : COLOR.wrong;
  const correctCount = words.filter(w => w.status === "correct").length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Recitation Practice</Text>
        <View style={[s.pill, { backgroundColor: "#22C55E18" }]}>
          <Feather name="activity" size={11} color="#22C55E" />
          <Text style={[s.pillText, { color: "#22C55E" }]}>AI Scoring</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── Surah tabs ── */}
        <View style={s.tabRow}>
          {SURAHS.map((su, i) => (
            <TouchableOpacity
              key={i}
              style={[s.tab, {
                backgroundColor: surahIdx === i ? colors.primary : colors.muted,
                borderColor:     surahIdx === i ? colors.primary : colors.border,
              }]}
              onPress={() => { setSurahIdx(i); setAyahIdx(0); reset(); }}
            >
              <Text style={[s.tabText, { color: surahIdx === i ? "#fff" : colors.mutedForeground }]}>
                {su.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Ayah dots ── */}
        <View style={s.dotRow}>
          {surah.ayahs.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => { setAyahIdx(i); reset(); }}>
              <View style={[s.dot, {
                width:           i === ayahIdx ? 24 : 8,
                backgroundColor: i === ayahIdx ? colors.primary : colors.border,
              }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Ayah card ── */}
        <View style={[s.ayahCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.ayahMeta, { color: colors.mutedForeground }]}>
            {surah.label} · Ayah {ayahIdx + 1}/{surah.ayahs.length}
          </Text>
          <Text style={[s.arabic, { color: colors.foreground }]}>{ayah.arabic}</Text>
          <Text style={[s.translit, { color: colors.primary }]}>{ayah.transliteration}</Text>
          <View style={[s.translationRow, { borderLeftColor: colors.primary, backgroundColor: colors.muted + "50" }]}>
            <Text style={[s.translation, { color: colors.foreground }]}>{ayah.translation}</Text>
          </View>
        </View>

        {/* ── Manual input mode ── */}
        {stage === "manual" && (
          <View style={[s.manualCard, { backgroundColor: colors.card, borderColor: "#F59E0B50" }]}>
            <View style={s.manualHeader}>
              <Feather name="edit-3" size={16} color="#F59E0B" />
              <Text style={[s.manualTitle, { color: colors.foreground }]}>Manual Input</Text>
            </View>
            <Text style={[s.manualSub, { color: colors.mutedForeground }]}>{errorMsg}</Text>
            <TextInput
              style={[s.manualInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              value={manual}
              onChangeText={setManual}
              placeholder="Type the Arabic you recited..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlign="right"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[s.submitBtn, { backgroundColor: colors.primary, opacity: manual.trim() ? 1 : 0.4 }]}
              onPress={submitManual}
              disabled={!manual.trim()}
            >
              <Text style={s.submitBtnText}>Check My Recitation</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={reset} style={s.skipBtn}>
              <Text style={[s.skipText, { color: colors.mutedForeground }]}>Try recording again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Result card ── */}
        {stage === "result" && (
          <View style={[s.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>

            {/* Score row */}
            <View style={s.scoreRow}>
              <View style={[s.scoreCircle, { borderColor: scoreColor }]}>
                <Text style={[s.scoreNum, { color: scoreColor }]}>{score}</Text>
                <Text style={[s.scoreSub, { color: colors.mutedForeground }]}>/100</Text>
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={[s.scoreLabel, { color: colors.foreground }]}>
                  {score >= 85 ? "Excellent! 🌟" : score >= 60 ? "Good effort! 👍" : "Keep practicing 💪"}
                </Text>
                <Text style={[s.scoreDesc, { color: colors.mutedForeground }]}>
                  {correctCount}/{words.length} words correct
                </Text>
                {/* Progress bar */}
                <View style={[s.bar, { backgroundColor: colors.border }]}>
                  <View style={[s.barFill, { width: `${score}%` as any, backgroundColor: scoreColor }]} />
                </View>
              </View>
            </View>

            {/* Word chips */}
            {words.length > 0 && (
              <>
                <Text style={[s.chipLabel, { color: colors.mutedForeground }]}>WORD BY WORD</Text>
                <View style={s.chipRow}>
                  {words.map((w, i) => (
                    <View key={i} style={[s.chip, {
                      backgroundColor: COLOR[w.status] + "15",
                      borderColor:     COLOR[w.status] + "50",
                    }]}>
                      <Text style={[s.chipArabic, { color: COLOR[w.status] }]}>{w.word}</Text>
                      <Text style={[s.chipStatus, { color: COLOR[w.status] }]}>
                        {w.status === "correct" ? "✓ Correct" : w.status === "intermediate" ? "~ Close" : "✗ Wrong"}
                      </Text>
                      {w.status !== "correct" && w.heard ? (
                        <Text style={[s.chipHeard, { color: colors.mutedForeground }]} numberOfLines={1}>
                          heard: {w.heard}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* ── Recorder ── */}
        <View style={s.recorderSection}>
          {/* Waveform */}
          <View style={s.waveform}>
            {waveAnims.map((anim, i) => (
              <Animated.View key={i} style={[s.wavebar, {
                backgroundColor: stage === "recording" ? "#8B5CF6" : colors.border,
                transform:       [{ scaleY: anim }],
                opacity:         stage === "recording" ? 1 : 0.3,
              }]} />
            ))}
          </View>

          {/* Mic / Processing button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handleMic}
              activeOpacity={0.85}
              disabled={stage === "processing" || stage === "manual"}
            >
              {stage === "processing" ? (
                <LinearGradient colors={["#6B7280", "#4B5563"]} style={s.micBtn}>
                  <ActivityIndicator color="#FFFFFF" size="large" />
                </LinearGradient>
              ) : stage === "recording" ? (
                <LinearGradient colors={["#EF4444", "#DC2626"]} style={s.micBtn}>
                  <Feather name="square" size={32} color="#FFFFFF" />
                </LinearGradient>
              ) : (
                <LinearGradient colors={["#8B5CF6", "#6D28D9"]} style={s.micBtn}>
                  <Feather name="mic" size={36} color="#FFFFFF" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={[s.hint, { color: colors.mutedForeground }]}>
            {stage === "idle"       ? "Tap mic and recite the ayah above"  :
             stage === "recording"  ? "🎙 Listening... tap ■ when done"    :
             stage === "processing" ? "⏳ Analysing with AI..."             :
             stage === "manual"     ? "Enter your recitation above ↑"       : ""}
          </Text>

          {/* Action buttons */}
          {stage === "result" && (
            <View style={s.actionRow}>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.muted }]} onPress={reset}>
                <Feather name="refresh-cw" size={15} color={colors.foreground} />
                <Text style={[s.actionText, { color: colors.foreground }]}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.primary }]} onPress={nextAyah}>
                <Text style={[s.actionText, { color: "#fff" }]}>Next Ayah</Text>
                <Feather name="arrow-right" size={15} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Tips ── */}
        {stage === "idle" && (
          <View style={[s.tip, { backgroundColor: colors.secondary, marginHorizontal: 16, marginBottom: 28 }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[s.tipText, { color: colors.foreground }]}>
              Speak clearly in Arabic. Each word is scored individually — you cannot fake your score.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:   { flex: 1 },
  header:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn:  { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  pill:     { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { fontSize: 11, fontFamily: "Inter_700Bold" },

  tabRow:   { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 16, paddingHorizontal: 16 },
  tab:      { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 24, borderWidth: 1 },
  tabText:  { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  dotRow:   { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
  dot:      { height: 8, borderRadius: 4 },

  ayahCard:      { margin: 16, padding: 18, borderRadius: 18, borderWidth: 1, gap: 10 },
  ayahMeta:      { fontSize: 12, fontFamily: "Inter_500Medium" },
  arabic:        { fontSize: 28, textAlign: "right", lineHeight: 52, fontWeight: "400", writingDirection: "rtl" },
  translit:      { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic", textAlign: "right" },
  translationRow:{ borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 8, borderRadius: 4 },
  translation:   { fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 22 },

  manualCard:    { marginHorizontal: 16, marginBottom: 4, padding: 18, borderRadius: 18, borderWidth: 1, gap: 12 },
  manualHeader:  { flexDirection: "row", alignItems: "center", gap: 8 },
  manualTitle:   { fontSize: 15, fontFamily: "Inter_700Bold" },
  manualSub:     { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  manualInput:   { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 18, minHeight: 80, textAlignVertical: "top" },
  submitBtn:     { paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  skipBtn:       { alignItems: "center", paddingVertical: 6 },
  skipText:      { fontSize: 13, fontFamily: "Inter_400Regular" },

  resultCard:    { marginHorizontal: 16, marginBottom: 4, padding: 18, borderRadius: 18, borderWidth: 1, gap: 14 },
  scoreRow:      { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreCircle:   { width: 78, height: 78, borderRadius: 39, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  scoreNum:      { fontSize: 26, fontFamily: "Inter_700Bold" },
  scoreSub:      { fontSize: 11, fontFamily: "Inter_400Regular" },
  scoreLabel:    { fontSize: 16, fontFamily: "Inter_700Bold" },
  scoreDesc:     { fontSize: 12, fontFamily: "Inter_400Regular" },
  bar:           { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 2 },
  barFill:       { height: "100%", borderRadius: 3 },
  chipLabel:     { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  chipRow:       { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:          { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, borderWidth: 1, alignItems: "center", minWidth: 64 },
  chipArabic:    { fontSize: 20, fontWeight: "400" },
  chipStatus:    { fontSize: 10, fontFamily: "Inter_600SemiBold", marginTop: 3 },
  chipHeard:     { fontSize: 9, fontFamily: "Inter_400Regular", marginTop: 1, fontStyle: "italic" },

  recorderSection: { alignItems: "center", paddingVertical: 24, gap: 18 },
  waveform:      { flexDirection: "row", alignItems: "center", gap: 5, height: 54 },
  wavebar:       { width: 4, height: 40, borderRadius: 2 },
  micBtn:        { width: 92, height: 92, borderRadius: 46, alignItems: "center", justifyContent: "center", shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 10 },
  hint:          { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 32 },
  actionRow:     { flexDirection: "row", gap: 12, paddingHorizontal: 16, width: "100%" },
  actionBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  actionText:    { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  tip:     { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});

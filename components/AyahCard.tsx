import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import HifzView, { HifzDifficulty } from "@/components/HifzView";
import WordByWordView from "@/components/WordByWordView";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { fetchTafseer } from "@/services/aiService";
import {
  AI_TAFSEER_LANGUAGES,
  SCHOLAR_TAFSEERS,
} from "@/services/quranApi";

interface Props {
  ayah: {
    number: number;
    arabic: string;
    translation: string;
    transliteration?: string;
    audioUrl?: string;
    globalNumber?: number;
  };
  surahId: number;
  surahName?: string;
  showTranslation?: boolean;
  showTransliteration?: boolean;
  showWordByWord?: boolean;
  hifzMode?: boolean;
  hifzDifficulty?: HifzDifficulty;
  isPlaying?: boolean;
  isLoading?: boolean;
  onPlayPress?: () => void;
  fontSize?: number;
  playbackProgress?: number;
}

type TafseerSource = "ai" | "scholar";

export default function AyahCard({
  ayah,
  surahId,
  surahName = "Surah",
  showTranslation = true,
  showTransliteration = false,
  showWordByWord = false,
  hifzMode = false,
  hifzDifficulty = "medium",
  isPlaying = false,
  isLoading = false,
  onPlayPress,
  fontSize = 24,
  playbackProgress = 0,
}: Props) {
  const colors = useColors();
  const { toggleBookmark, bookmarks } = useApp();
  const ayahId = ayah.globalNumber ?? ayah.number;
  const isBookmarked = bookmarks.includes(ayahId);
  const [tafseerVisible, setTafseerVisible] = useState(false);
  const [wbwExpanded, setWbwExpanded] = useState(false);

  // ── AI Tafseer state ──
  const [aiTafseer, setAiTafseer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [tafseerLang, setTafseerLang] = useState("English");

  // ── Scholar Tafseer state ──
  const [scholarTafseer, setScholarTafseer] = useState("");
  const [scholarLoading, setScholarLoading] = useState(false);
  const [selectedScholarId, setSelectedScholarId] = useState(169);

  // ── Source tab state ──
  const [tafseerSource, setTafseerSource] = useState<TafseerSource>("ai");

  const handleBookmark = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    toggleBookmark(ayahId);
  };

  const loadAiTafseer = async (lang: string) => {
    setAiLoading(true);
    try {
      const result = await fetchTafseer(
        surahId, surahName, ayah.number, ayah.arabic, ayah.translation, lang
      );
      setAiTafseer(result.tafseer);
    } catch {
      setAiTafseer("Could not load tafseer. Please check your connection and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const loadScholarTafseer = async (scholarId: number) => {
    setScholarTafseer("");
    setScholarLoading(true);
    const scholar = SCHOLAR_TAFSEERS.find(s => s.id === scholarId);
    try {
      const result = await fetchTafseer(
        surahId, surahName, ayah.number, ayah.arabic, ayah.translation,
        scholar?.langCode === "ar" ? "Arabic" : "English", scholar?.fullName
      );
      setScholarTafseer(result.tafseer);
    } catch {
      setScholarTafseer("Could not load tafseer. Please check your connection.");
    } finally {
      setScholarLoading(false);
    }
  };

  const handleTafseer = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setTafseerVisible(true);
    if (tafseerSource === "ai" && !aiTafseer) {
      await loadAiTafseer(tafseerLang);
    } else if (tafseerSource === "scholar" && !scholarTafseer) {
      await loadScholarTafseer(selectedScholarId);
    }
  };

  const handleSourceChange = async (source: TafseerSource) => {
    setTafseerSource(source);
    if (source === "ai" && !aiTafseer) {
      await loadAiTafseer(tafseerLang);
    } else if (source === "scholar" && !scholarTafseer) {
      await loadScholarTafseer(selectedScholarId);
    }
  };

  const handleLangChange = async (lang: string) => {
    setTafseerLang(lang);
    setAiTafseer("");
    await loadAiTafseer(lang);
  };

  const handleScholarChange = async (scholarId: number) => {
    setSelectedScholarId(scholarId);
    setScholarTafseer("");
    await loadScholarTafseer(scholarId);
  };

  const selectedScholar = SCHOLAR_TAFSEERS.find(s => s.id === selectedScholarId) ?? SCHOLAR_TAFSEERS[0]!;
  const selectedLang = AI_TAFSEER_LANGUAGES.find(l => l.code === tafseerLang) ?? AI_TAFSEER_LANGUAGES[0]!;
  const isLoadingContent = tafseerSource === "ai" ? aiLoading : scholarLoading;
  const tafseerContent = tafseerSource === "ai" ? aiTafseer : scholarTafseer;

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isPlaying ? colors.secondary : colors.card,
            borderColor: isPlaying ? colors.primary : colors.border,
          },
        ]}
      >
        {/* ── Header row ── */}
        <View style={styles.header}>
          <View style={[styles.ayahNum, { backgroundColor: isPlaying ? colors.primary : colors.secondary }]}>
            <Text style={[styles.ayahNumText, { color: isPlaying ? "#FFFFFF" : colors.primary }]}>
              {ayah.number}
            </Text>
          </View>

          <View style={styles.actions}>
            {onPlayPress && (
              <TouchableOpacity
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  onPlayPress();
                }}
                style={[styles.actionBtn, { backgroundColor: isPlaying ? colors.primary : colors.muted }]}
              >
                {isLoading ? (
                  <ActivityIndicator size={13} color={isPlaying ? "#FFFFFF" : colors.primary} />
                ) : (
                  <Feather name={isPlaying ? "pause" : "play"} size={13} color={isPlaying ? "#FFFFFF" : colors.primary} />
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleTafseer}
              style={[styles.iconBtn, { backgroundColor: "#8B5CF615", borderRadius: 10 }]}
            >
              <Feather name="book" size={13} color="#8B5CF6" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBookmark} style={styles.iconBtn}>
              {isBookmarked ? (
                <Ionicons name="bookmark" size={15} color="#10B981" />
              ) : (
                <Feather name="bookmark" size={13} color={colors.mutedForeground} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hifz or Arabic text ── */}
        {hifzMode ? (
          <View style={[styles.hifzContainer, { backgroundColor: colors.background, borderColor: "#F59E0B30" }]}>
            <HifzView
              arabic={ayah.arabic}
              translation={ayah.translation}
              ayahNumber={ayah.number}
              surahId={surahId}
              surahName={surahName}
              fontSize={fontSize}
              difficulty={hifzDifficulty}
              showTranslation={showTranslation}
            />
          </View>
        ) : (
          <Text style={[styles.arabic, { color: colors.foreground, fontSize }]}>
            {ayah.arabic}
          </Text>
        )}

        {/* ── Word-by-word overlay ── */}
        {(showWordByWord || wbwExpanded) && (
          <View style={[styles.wbwContainer, { backgroundColor: colors.background, borderColor: colors.primary + "25" }]}>
            <View style={styles.wbwHeader}>
              <View style={[styles.wbwBadge, { backgroundColor: colors.primary + "12" }]}>
                <Feather name="grid" size={10} color={colors.primary} />
                <Text style={[styles.wbwBadgeText, { color: colors.primary }]}>Word-by-Word</Text>
              </View>
              <TouchableOpacity onPress={() => setWbwExpanded(false)} style={styles.wbwClose}>
                <Feather name="chevron-up" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <WordByWordView
              surahId={surahId}
              ayahNumber={ayah.number}
              fontSize={fontSize}
              isPlaying={isPlaying}
              playbackProgress={playbackProgress}
            />
          </View>
        )}

        {/* ── Transliteration ── */}
        {showTransliteration && ayah.transliteration && (
          <Text style={[styles.transliteration, { color: colors.mutedForeground }]}>
            {ayah.transliteration}
          </Text>
        )}

        {/* ── Translation ── */}
        {showTranslation && (
          <View style={styles.translationWrap}>
            <View style={[styles.translationAccent, { backgroundColor: colors.primary + "30" }]} />
            <Text style={[styles.translation, { color: colors.mutedForeground }]}>
              {ayah.translation}
            </Text>
          </View>
        )}
      </View>

      {/* ── Tafseer modal ── */}
      <Modal visible={tafseerVisible} animationType="slide" transparent onRequestClose={() => setTafseerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={[styles.modalTitleText, { color: colors.foreground }]}>Tafseer</Text>
                <TouchableOpacity onPress={() => setTafseerVisible(false)}>
                  <Feather name="x" size={22} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.modalRef, { color: colors.mutedForeground }]}>
                {surahName} · Ayah {ayah.number}
              </Text>
            </View>

            {/* Ayah preview box */}
            <View style={[styles.modalAyahBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.modalArabic, { color: colors.foreground }]}>{ayah.arabic}</Text>
              <Text style={[styles.modalTranslation, { color: colors.mutedForeground }]}>{ayah.translation}</Text>
            </View>

            {/* Source tabs */}
            <View style={[styles.sourceTabs, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.sourceTab,
                  tafseerSource === "ai" && { backgroundColor: colors.background, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
                ]}
                onPress={() => handleSourceChange("ai")}
              >
                <Feather name="cpu" size={14} color={tafseerSource === "ai" ? "#8B5CF6" : colors.mutedForeground} />
                <Text style={[styles.sourceTabText, { color: tafseerSource === "ai" ? "#8B5CF6" : colors.mutedForeground }]}>
                  AI Tafseer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sourceTab,
                  tafseerSource === "scholar" && { backgroundColor: colors.background, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
                ]}
                onPress={() => handleSourceChange("scholar")}
              >
                <Feather name="book-open" size={14} color={tafseerSource === "scholar" ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.sourceTabText, { color: tafseerSource === "scholar" ? colors.primary : colors.mutedForeground }]}>
                  Scholars
                </Text>
              </TouchableOpacity>
            </View>

            {/* AI language selector OR Scholar selector */}
            {tafseerSource === "ai" ? (
              <View style={styles.selectorSection}>
                <Text style={[styles.selectorLabel, { color: colors.mutedForeground }]}>Language</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScrollRow}>
                  {AI_TAFSEER_LANGUAGES.map(lang => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langChip,
                        {
                          backgroundColor: tafseerLang === lang.code ? "#8B5CF620" : colors.muted,
                          borderColor: tafseerLang === lang.code ? "#8B5CF6" : colors.border,
                        },
                      ]}
                      onPress={() => handleLangChange(lang.code)}
                    >
                      <Text style={styles.langFlag}>{lang.flag}</Text>
                      <Text style={[styles.langChipText, { color: tafseerLang === lang.code ? "#8B5CF6" : colors.foreground }]}>
                        {lang.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.selectorSection}>
                <Text style={[styles.selectorLabel, { color: colors.mutedForeground }]}>Scholar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScrollRow}>
                  {SCHOLAR_TAFSEERS.map(scholar => (
                    <TouchableOpacity
                      key={scholar.id}
                      style={[
                        styles.scholarChip,
                        {
                          backgroundColor: selectedScholarId === scholar.id ? colors.primary + "15" : colors.muted,
                          borderColor: selectedScholarId === scholar.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleScholarChange(scholar.id)}
                    >
                      <Text style={styles.langFlag}>{scholar.flag}</Text>
                      <View>
                        <Text style={[styles.scholarName, { color: selectedScholarId === scholar.id ? colors.primary : colors.foreground }]}>
                          {scholar.scholar}
                        </Text>
                        <Text style={[styles.scholarLang, { color: colors.mutedForeground }]}>
                          {scholar.language}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Tafseer content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {isLoadingContent ? (
                <View style={styles.tafseerLoading}>
                  <ActivityIndicator color={tafseerSource === "ai" ? "#8B5CF6" : colors.primary} size="large" />
                  <Text style={[styles.tafseerLoadingText, { color: colors.mutedForeground }]}>
                    {tafseerSource === "ai"
                      ? `Generating tafseer in ${tafseerLang}...`
                      : `Generating ${selectedScholar.scholar} tafseer...`}
                  </Text>
                </View>
              ) : tafseerContent ? (
                <>
                  <View style={[styles.tafseerSourceBadge, {
                    backgroundColor: tafseerSource === "ai" ? "#8B5CF615" : colors.secondary,
                    borderColor: tafseerSource === "ai" ? "#8B5CF630" : colors.primary + "30",
                  }]}>
                    {tafseerSource === "ai" ? (
                      <>
                        <Feather name="cpu" size={12} color="#8B5CF6" />
                        <Text style={[styles.tafseerSourceText, { color: "#8B5CF6" }]}>
                          AI · {selectedLang.flag} {tafseerLang}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.tafseerSourceFlag}>{selectedScholar.flag}</Text>
                        <Text style={[styles.tafseerSourceText, { color: colors.primary }]}>
                          {selectedScholar.fullName} · {selectedScholar.language}
                        </Text>
                        {selectedScholar.era && (
                          <View style={[styles.eraBadge, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.eraText, { color: colors.mutedForeground }]}>{selectedScholar.era}</Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>

                  <View style={[styles.tafseerContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.tafseerText, { color: colors.foreground }]}>{tafseerContent}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.refreshTafseer, { borderColor: colors.border }]}
                    onPress={() => {
                      if (tafseerSource === "ai") {
                        setAiTafseer(""); loadAiTafseer(tafseerLang);
                      } else {
                        setScholarTafseer(""); loadScholarTafseer(selectedScholarId);
                      }
                    }}
                  >
                    <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.refreshTafseerText, { color: colors.mutedForeground }]}>Regenerate</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.tafseerLoading}>
                  <Feather name="book" size={28} color={colors.border} />
                  <Text style={[styles.tafseerLoadingText, { color: colors.mutedForeground }]}>
                    Select a language or scholar above
                  </Text>
                </View>
              )}

              {tafseerSource === "ai" && (
                <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
                  AI-generated tafseer. For authoritative scholarship, consult certified Islamic scholars.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  ayahNum: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  ayahNumText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  actions: { flexDirection: "row", gap: 4, alignItems: "center" },
  actionBtn: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  iconBtn: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  arabic: { textAlign: "right", lineHeight: 48, fontWeight: "400", writingDirection: "rtl", marginBottom: 2, letterSpacing: 0.5 },
  hifzContainer: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 4, marginBottom: 4, gap: 10 },
  wbwContainer: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 8, gap: 10 },
  wbwHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wbwBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  wbwBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  wbwClose: { padding: 4 },
  transliteration: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic", marginBottom: 6, lineHeight: 18 },
  translationWrap: { flexDirection: "row", gap: 8 },
  translationAccent: { width: 3, borderRadius: 2, marginTop: 2 },
  translation: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%", minHeight: "65%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 8 },
  modalHeader: { paddingHorizontal: 20, paddingBottom: 10, gap: 4 },
  modalTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitleText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalRef: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalAyahBox: { marginHorizontal: 20, marginBottom: 12, padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  modalArabic: { fontSize: 18, textAlign: "right", lineHeight: 34, fontWeight: "400", writingDirection: "rtl" },
  modalTranslation: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, fontStyle: "italic" },

  // Source tabs
  sourceTabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  sourceTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  sourceTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Selectors
  selectorSection: { gap: 6, marginBottom: 8 },
  selectorLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, paddingHorizontal: 20 },
  langScrollRow: { paddingHorizontal: 20, gap: 8 },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  langFlag: { fontSize: 16 },
  langChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  scholarChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 120,
  },
  scholarName: { fontSize: 12, fontFamily: "Inter_700Bold" },
  scholarLang: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 1 },

  // Content
  modalContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  tafseerLoading: { alignItems: "center", paddingVertical: 40, gap: 14 },
  tafseerLoadingText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  tafseerSourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
    flexWrap: "wrap",
  },
  tafseerSourceText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tafseerSourceFlag: { fontSize: 14 },
  eraBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  eraText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  tafseerContent: { padding: 16, borderRadius: 16, borderWidth: 1 },
  tafseerText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 24 },
  refreshTafseer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
  },
  refreshTafseerText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
});

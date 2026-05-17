import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  FlatList,
  View,
} from "react-native";
import { FlashList as ShopifyFlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const TypedFlashList = ShopifyFlashList as any;

import AudioPlayer from "@/components/AudioPlayer";
import AyahCard from "@/components/AyahCard";
import { HifzDifficulty } from "@/components/HifzView";
import { DEFAULT_RECITER, Reciter } from "@/constants/reciters";
import { useApp } from "@/context/AppContext";
import { useQuranSurah } from "@/hooks/useQuranSurah";
import { useColors } from "@/hooks/useColors";
import { AUDIO_CDN, TRANSLATION_OPTIONS } from "@/services/quranApi";
import { downloadAudio } from "@/services/offlineService";

const FONT_SIZES = [18, 20, 22, 24, 26, 28, 32];

export default function SurahScreen() {
  const { id, hifz } = useLocalSearchParams<{ id: string; hifz?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setLastRead, fontSize, setFontSize, translationLang, setTranslationLang } = useApp();

  const surahId = parseInt(id ?? "1");
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTranslit, setShowTranslit] = useState(false);
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [hifzMode, setHifzMode] = useState(hifz === "true");
  const [hifzDifficulty, setHifzDifficulty] = useState<HifzDifficulty>("medium");
  const [hifzModalVisible, setHifzModalVisible] = useState(false);
  const [reciter, setReciter] = useState<Reciter>(DEFAULT_RECITER);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [fontModalVisible, setFontModalVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const listRef = useRef<any>(null);

  const currentTranslation =
    TRANSLATION_OPTIONS.find((t) => t.id === translationLang) ?? TRANSLATION_OPTIONS[0]!;

  const { data, isLoading, isError, refetch } = useQuranSurah(
    surahId,
    reciter.edition,
    translationLang
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const audioUrls =
    data?.audioAyahs.map(
      (a) => a.audio ?? `${AUDIO_CDN}/${reciter.edition}/${a.number}.mp3`
    ) ?? [];

  const ayahNumbers = data?.arabicAyahs.map((a) => a.numberInSurah) ?? [];

  const handleScroll = useCallback(({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!data) return;
    const progress =
      nativeEvent.contentOffset.y /
      Math.max(
        1,
        nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height
      );
    const ayahIndex = Math.floor(
      progress * (data.arabicAyahs.length - 1)
    );
    setLastRead(surahId, ayahNumbers[ayahIndex] ?? ayahIndex + 1);
  }, [data, ayahNumbers, surahId, setLastRead]);

  const handleDownload = async () => {
    if (!data || isDownloading) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsDownloading(true);
      setDownloadProgress(0);

      const total = data.audioAyahs.length;
      for (let i = 0; i < total; i++) {
        const ayah = data.audioAyahs[i];
        const url = ayah.audio ?? `${AUDIO_CDN}/${reciter.edition}/${ayah.number}.mp3`;
        await downloadAudio(url);
        setDownloadProgress((i + 1) / total);
      }

      setIsDownloading(false);
      alert("Surah downloaded for offline use!");
    } catch (error) {
      setIsDownloading(false);
      console.error("Download failed:", error);
    }
  };

  const surahDescription =
    data?.surah.revelationType === "Meccan"
      ? "Meccan Surah — Revealed in Makkah"
      : "Medinan Surah — Revealed in Madinah";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Fixed header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 12,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Title row */}
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.surahName, { color: colors.foreground }]}>
              {data?.surah.englishName ?? `Surah ${surahId}`}
            </Text>
            {data ? (
              <Text style={[styles.surahMeta, { color: colors.mutedForeground }]}>
                {data.surah.numberOfAyahs} Ayahs · {surahDescription}
              </Text>
            ) : (
              <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
                <View style={{ width: 60, height: 12, borderRadius: 4, backgroundColor: colors.border }} />
                <View style={{ width: 80, height: 12, borderRadius: 4, backgroundColor: colors.border }} />
              </View>
            )}
          </View>
          <Text style={[styles.arabicName, { color: colors.primary }]}>
            {data?.surah.name ?? ""}
          </Text>
        </View>

        {/* Controls row: display toggles */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.controlsRow}
        >
          <ToggleBtn
            label="Translation"
            active={showTranslation}
            onPress={() => setShowTranslation((p) => !p)}
            colors={colors}
          />
          <ToggleBtn
            label="Transliteration"
            active={showTranslit}
            onPress={() => setShowTranslit((p) => !p)}
            colors={colors}
          />
          <ToggleBtn
            icon="grid"
            label="Word-by-Word"
            active={showWordByWord}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { }
              setShowWordByWord((p) => !p);
            }}
            colors={colors}
            accent
          />
          <TouchableOpacity
            style={[
              styles.controlBtn,
              {
                flexDirection: "row",
                gap: 5,
                backgroundColor: hifzMode ? "#F59E0B" : colors.muted,
              },
            ]}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { }
              if (hifzMode) {
                setHifzMode(false);
              } else {
                setHifzModalVisible(true);
              }
            }}
          >
            <Feather name="eye-off" size={12} color={hifzMode ? "#FFFFFF" : colors.mutedForeground} />
            <Text style={[styles.controlText, { color: hifzMode ? "#FFFFFF" : colors.mutedForeground }]}>
              {hifzMode ? "Exit Hifz" : "Hifz"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              { backgroundColor: colors.muted, flexDirection: "row", gap: 4 },
            ]}
            onPress={() => setLangModalVisible(true)}
          >
            <Text style={{ fontSize: 13 }}>{currentTranslation.flag}</Text>
            <Text style={[styles.controlText, { color: colors.mutedForeground }]}>
              {currentTranslation.label.split(" ")[0]}
            </Text>
            <Feather name="chevron-down" size={11} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.muted, flexDirection: "row", gap: 4 }]}
            onPress={() => setFontModalVisible(true)}
          >
            <Feather name="type" size={12} color={colors.mutedForeground} />
            <Text style={[styles.controlText, { color: colors.mutedForeground }]}>
              {fontSize}px
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlBtn,
              {
                backgroundColor: isDownloading ? colors.primary + "20" : colors.muted,
                flexDirection: "row",
                gap: 6,
                minWidth: 100
              }
            ]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.controlText, { color: colors.primary }]}>
                  {Math.round(downloadProgress * 100)}%
                </Text>
              </>
            ) : (
              <>
                <Feather name="download" size={12} color={colors.primary} />
                <Text style={[styles.controlText, { color: colors.primary }]}>Download</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Word-by-word banner when active */}
        {showWordByWord && (
          <View style={[styles.wbwBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
            <Feather name="grid" size={13} color={colors.primary} />
            <Text style={[styles.wbwBannerText, { color: colors.primary }]}>
              Word-by-Word mode — tap any ayah's grid icon or use the button below the Arabic text
            </Text>
          </View>
        )}

        {/* Hifz mode banner */}
        {hifzMode && (
          <View style={[styles.wbwBanner, { backgroundColor: "#F59E0B12", borderColor: "#F59E0B30" }]}>
            <Feather name="eye-off" size={13} color="#F59E0B" />
            <Text style={[styles.wbwBannerText, { color: "#F59E0B" }]}>
              Hifz Mode ({hifzDifficulty}) — tap hidden words to reveal them. Tap "Exit Hifz" to return to normal reading.
            </Text>
          </View>
        )}
      </View>

      {/* ── Audio player ── */}
      {data && (
        <AudioPlayer
          audioUrls={audioUrls}
          ayahNumbers={ayahNumbers}
          currentIndex={currentAyahIdx}
          onAyahChange={(idx) => {
            setCurrentAyahIdx(idx);
            setPlayingIdx(idx);
            setAudioPosition(0);
            setAudioDuration(0);
            setLastRead(surahId, ayahNumbers[idx] ?? idx + 1);
          }}
          onProgress={(pos, dur) => {
            setAudioPosition(pos);
            setAudioDuration(dur);
          }}
          reciter={reciter}
          onReciterChange={(r) => {
            setReciter(r);
            setPlayingIdx(null);
            setAudioPosition(0);
            setAudioDuration(0);
          }}
          totalAyahs={data.surah.numberOfAyahs}
          surahName={data.surah.englishName}
        />
      )}

      {isLoading && (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading surah...
          </Text>
        </View>
      )}

      {isError && (
        <View style={styles.loadingState}>
          <View style={[styles.errorIconBox, { backgroundColor: colors.destructive + "15" }]}>
            <Feather name="wifi-off" size={24} color={colors.destructive} />
          </View>
          <Text style={[styles.loadingText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Could not load surah
          </Text>
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => refetch()}
          >
            <Feather name="refresh-cw" size={14} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Ayah list (FlashList for smooth performance) ── */}
      {data && (
        // @ts-ignore
        <TypedFlashList
          ref={listRef}
          data={data.arabicAyahs}
          keyExtractor={(item: any) => String(item.numberInSurah)}
          estimatedItemSize={250}
          removeClippedSubviews={Platform.OS !== "web"}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          ListHeaderComponent={
            <>
              {/* Bismillah */}
              {surahId !== 9 && surahId !== 1 && (
                <View style={styles.bismillah}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, width: "60%" }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    <Feather name="star" size={10} color={colors.primary} />
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                  </View>
                  <Text style={[styles.bismillahText, { color: colors.foreground }]}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </Text>
                  <Text style={[styles.bismillahTrans, { color: colors.mutedForeground }]}>
                    In the name of Allah, the Most Gracious, the Most Merciful
                  </Text>
                  <View style={{ width: "40%", height: 1, backgroundColor: colors.border }} />
                </View>
              )}

              {/* Surah info banner */}
              {data?.surah && (
                <View
                  style={[
                    styles.surahInfoBanner,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.surahInfoItem}>
                    <Feather name="hash" size={13} color={colors.primary} />
                    <Text style={[styles.surahInfoValue, { color: colors.foreground }]}>
                      {surahId}
                    </Text>
                    <Text style={[styles.surahInfoLabel, { color: colors.mutedForeground }]}>
                      Surah
                    </Text>
                  </View>
                  <View style={[styles.surahInfoDiv, { backgroundColor: colors.border }]} />
                  <View style={styles.surahInfoItem}>
                    <Feather name="book-open" size={13} color={colors.primary} />
                    <Text style={[styles.surahInfoValue, { color: colors.foreground }]}>
                      {data.surah.numberOfAyahs}
                    </Text>
                    <Text style={[styles.surahInfoLabel, { color: colors.mutedForeground }]}>
                      Ayahs
                    </Text>
                  </View>
                  <View style={[styles.surahInfoDiv, { backgroundColor: colors.border }]} />
                  <View style={styles.surahInfoItem}>
                    <Feather name={data.surah.revelationType === "Meccan" ? "sunrise" : "moon"} size={13} color={colors.primary} />
                    <Text style={[styles.surahInfoValue, { color: colors.foreground }]} numberOfLines={1}>
                      {data.surah.revelationType}
                    </Text>
                    <Text style={[styles.surahInfoLabel, { color: colors.mutedForeground }]}>
                      Origin
                    </Text>
                  </View>
                  <View style={[styles.surahInfoDiv, { backgroundColor: colors.border }]} />
                  <View style={styles.surahInfoItem}>
                    <Feather name="globe" size={13} color={colors.primary} />
                    <Text style={[styles.surahInfoValue, { color: colors.foreground }]} numberOfLines={1}>
                      {data.surah.englishNameTranslation}
                    </Text>
                    <Text style={[styles.surahInfoLabel, { color: colors.mutedForeground }]}>
                      Meaning
                    </Text>
                  </View>
                </View>
              )}

              {/* Word-by-word intro card when mode is active */}
              {showWordByWord && (
                <View
                  style={[
                    styles.wbwIntro,
                    { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" },
                  ]}
                >
                  <Feather name="info" size={14} color={colors.primary} />
                  <Text style={[styles.wbwIntroText, { color: colors.primary }]}>
                    Each Arabic word is shown with its transliteration and English meaning. Words flow right-to-left as in the original text.
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item: arabicAyah, index: idx }: ListRenderItemInfo<any>) => {
            const translationAyah = data.translationAyahs[idx];
            const secondaryAyah = data.secondaryTranslationAyahs?.[idx];
            const audioAyah = data.audioAyahs[idx];
            const audioUrl =
              audioAyah?.audio ??
              `${AUDIO_CDN}/${reciter.edition}/${arabicAyah.number}.mp3`;

            return (
              <AyahCard
                ayah={{
                  number: arabicAyah.numberInSurah,
                  arabic: arabicAyah.text,
                  translation: translationAyah?.text ?? "",
                  secondaryTranslation: secondaryAyah?.text ?? "",
                  audioUrl,
                  globalNumber: arabicAyah.number,
                }}
                surahId={surahId}
                surahName={data.surah.englishName}
                showTranslation={showTranslation}
                showTransliteration={showTranslit}
                showWordByWord={showWordByWord}
                hifzMode={hifzMode}
                hifzDifficulty={hifzDifficulty}
                isPlaying={playingIdx === idx}
                fontSize={fontSize}
                playbackProgress={
                  playingIdx === idx && audioDuration > 0
                    ? audioPosition / audioDuration
                    : 0
                }
                onPlayPress={() => {
                  setCurrentAyahIdx(idx);
                  setPlayingIdx(playingIdx === idx ? null : idx);
                }}
              />
            );
          }}
        />
      )}

      {/* ── Language modal ── */}
      <Modal
        visible={langModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Translation Language
              </Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={TRANSLATION_OPTIONS}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.langOption,
                    {
                      backgroundColor:
                        translationLang === item.id
                          ? colors.secondary
                          : colors.card,
                      borderColor:
                        translationLang === item.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setTranslationLang(item.id);
                    setLangModalVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                  <Text
                    style={[
                      styles.langLabel,
                      {
                        color:
                          translationLang === item.id
                            ? colors.primary
                            : colors.foreground,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {translationLang === item.id && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ── Font size modal ── */}
      <Modal
        visible={fontModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFontModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                Arabic Font Size
              </Text>
              <TouchableOpacity onPress={() => setFontModalVisible(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20, gap: 20 }}>
              <Text
                style={[
                  styles.fontPreview,
                  { color: colors.foreground, fontSize },
                ]}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
              <View style={styles.fontGrid}>
                {FONT_SIZES.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontOption,
                      {
                        backgroundColor:
                          fontSize === size ? colors.primary : colors.card,
                        borderColor:
                          fontSize === size ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setFontSize(size);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text
                      style={[
                        styles.fontOptionText,
                        {
                          color: fontSize === size ? "#FFFFFF" : colors.foreground,
                        },
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.primary }]}
                onPress={() => setFontModalVisible(false)}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Hifz difficulty modal ── */}
      <Modal
        visible={hifzModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setHifzModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  Hifz Mode
                </Text>
                <Text style={[{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }]}>
                  Choose how many words to hide
                </Text>
              </View>
              <TouchableOpacity onPress={() => setHifzModalVisible(false)}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20, gap: 12 }}>
              {(
                [
                  { key: "easy" as HifzDifficulty, label: "Easy", desc: "Every other word hidden — good for beginners", color: "#10B981", icon: "😊" },
                  { key: "medium" as HifzDifficulty, label: "Medium", desc: "Most words hidden — challenge yourself", color: "#F59E0B", icon: "🧠" },
                  { key: "hard" as HifzDifficulty, label: "Hard", desc: "All words hidden — full recall test", color: "#EF4444", icon: "🔥" },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    {
                      flexDirection: "row" as const,
                      alignItems: "center" as const,
                      gap: 14,
                      padding: 16,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      backgroundColor: hifzDifficulty === opt.key ? opt.color + "15" : colors.card,
                      borderColor: hifzDifficulty === opt.key ? opt.color : colors.border,
                    },
                  ]}
                  onPress={() => setHifzDifficulty(opt.key)}
                >
                  <Text style={{ fontSize: 26 }}>{opt.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: hifzDifficulty === opt.key ? opt.color : colors.foreground }}>
                      {opt.label}
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 }}>
                      {opt.desc}
                    </Text>
                  </View>
                  {hifzDifficulty === opt.key && (
                    <Feather name="check-circle" size={20} color={opt.color} />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: "#F59E0B", marginTop: 8 }]}
                onPress={() => {
                  setHifzModalVisible(false);
                  setHifzMode(true);
                }}
              >
                <Feather name="eye-off" size={16} color="#FFFFFF" />
                <Text style={[styles.doneBtnText, { marginLeft: 8 }]}>Start Hifz Mode</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Small helper so the controls row is DRY */
function ToggleBtn({
  label,
  icon,
  active,
  onPress,
  colors,
  accent = false,
}: {
  label: string;
  icon?: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  accent?: boolean;
}) {
  const activeBg = accent ? "#0D5C3A" : colors.primary;
  return (
    <TouchableOpacity
      style={[
        styles.controlBtn,
        {
          backgroundColor: active ? activeBg : colors.muted,
          flexDirection: "row",
          gap: 5,
        },
      ]}
      onPress={onPress}
    >
      {icon && (
        <Feather
          name={icon as any}
          size={12}
          color={active ? "#FFFFFF" : colors.mutedForeground}
        />
      )}
      <Text
        style={[
          styles.controlText,
          { color: active ? "#FFFFFF" : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1 },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1 },
  surahName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  surahMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  arabicName: { fontSize: 24, fontWeight: "500" },
  controlsRow: { flexDirection: "row", gap: 8, paddingBottom: 10 },
  controlBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  controlText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  wbwBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  wbwBannerText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  errorIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  retryBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bismillah: { alignItems: "center", paddingVertical: 24, gap: 8 },
  bismillahText: { fontSize: 28, fontWeight: "500", lineHeight: 48 },
  bismillahTrans: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  surahInfoBanner: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  surahInfoItem: { flex: 1, alignItems: "center", gap: 3 },
  surahInfoLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  surahInfoValue: { fontSize: 12, fontFamily: "Inter_700Bold" },
  surahInfoDiv: { width: 1, marginVertical: 6 },
  wbwIntro: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  wbwIntroText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "75%",
    minHeight: "35%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  langLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  fontPreview: { textAlign: "center", lineHeight: 56 },
  fontGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  fontOption: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  fontOptionText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  doneBtn: { paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  doneBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

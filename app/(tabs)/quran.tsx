import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useQuranSurahs } from "@/hooks/useQuranSurahs";
import { ApiSurah, fetchJuzAyahs } from "@/services/quranApi";

const { width: SCREEN_W } = Dimensions.get("window");
const TABS = ["Surah", "Juz", "Bookmarks"];

const JUZ_DATA = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  name: `Juz ${i + 1}`,
  arabicName: `الجزء ${i + 1}`,
}));

// Surah type colors for visual variety
const SURAH_COLORS = [
  ["#0D5C3A","#1A8A5A"], ["#7C3AED","#A855F7"], ["#2563EB","#3B82F6"],
  ["#D97706","#F59E0B"], ["#DC2626","#EF4444"], ["#0E7490","#06B6D4"],
  ["#4D7C0F","#84CC16"], ["#9D174D","#EC4899"],
];

function AnimatedSurahRow({ item, onPress, progress, index }: {
  item: ApiSurah; onPress: () => void; progress?: number; index: number;
}) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-20)).current;
  const isDark = colors.background === "#0B1A2E";
  const colorPair = SURAH_COLORS[item.number % SURAH_COLORS.length]!;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: Math.min(index * 30, 300), useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 400, delay: Math.min(index * 30, 300), useNativeDriver: true }),
    ]).start();
  }, []);

  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }, { scale }] }}>
      <TouchableOpacity
        style={[styles.surahRow, { borderBottomColor: isDark ? "#1E3050" : "#E5F0EA" }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <LinearGradient colors={colorPair as [string,string]} style={styles.numBadge}>
          <Text style={styles.numText}>{item.number}</Text>
        </LinearGradient>

        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>{item.englishName}</Text>
          <Text style={[styles.surahMeta, { color: isDark ? "#64748B" : "#6B8C7A" }]}>
            {item.englishNameTranslation} • {item.numberOfAyahs} Ayahs • {item.revelationType}
          </Text>
          {progress !== undefined && progress > 0 && (
            <View style={[styles.progressBar, { backgroundColor: isDark ? "#1E3050" : "#E5F0EA" }]}>
              <LinearGradient
                colors={colorPair as [string,string]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress * 100}%` as any }]}
              />
            </View>
          )}
        </View>

        <View style={styles.arabicWrap}>
          <Text style={[styles.arabicName, { color: colorPair[0] }]}>{item.name}</Text>
          {item.revelationType === "Meccan" ? (
            <View style={[styles.revBadge, { backgroundColor: "#F59E0B22" }]}>
              <Text style={[styles.revText, { color: "#F59E0B" }]}>M</Text>
            </View>
          ) : (
            <View style={[styles.revBadge, { backgroundColor: "#10B98122" }]}>
              <Text style={[styles.revText, { color: "#10B981" }]}>M</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function JuzView() {
  const colors = useColors();
  const queryClient = useQueryClient();
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const isDark = colors.background === "#0B1A2E";

  const { data: juzSurahs, isLoading } = useQuery({
    queryKey: ["juz", selectedJuz],
    queryFn: () => fetchJuzAyahs(selectedJuz!),
    enabled: selectedJuz !== null,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const selectJuz = (num: number) => {
    setSelectedJuz(num);
    if (num > 1) queryClient.prefetchQuery({ queryKey: ["juz", num - 1], queryFn: () => fetchJuzAyahs(num - 1), staleTime: 1000 * 60 * 60 });
    if (num < 30) queryClient.prefetchQuery({ queryKey: ["juz", num + 1], queryFn: () => fetchJuzAyahs(num + 1), staleTime: 1000 * 60 * 60 });
  };

  if (!selectedJuz) {
    return (
      <FlatList
        data={JUZ_DATA}
        keyExtractor={item => String(item.number)}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12, marginBottom: 12 }}
        renderItem={({ item, index }) => {
          const colorPair = SURAH_COLORS[index % SURAH_COLORS.length]!;
          return (
            <TouchableOpacity
              style={[styles.juzCard, { backgroundColor: isDark ? "#0F1E30" : "#FFFFFF", borderColor: isDark ? "#1E3050" : "#D4E8DC" }]}
              onPress={() => selectJuz(item.number)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={colorPair as [string,string]} style={styles.juzCardBadge}>
                <Text style={styles.juzCardNum}>{item.number}</Text>
              </LinearGradient>
              <Text style={[styles.juzCardName, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>{item.name}</Text>
              <Text style={[styles.juzCardArabic, { color: colorPair[0] }]}>{item.arabicName}</Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={[styles.juzBackRow, { backgroundColor: isDark ? "#0F2335" : "#F0FAF5", borderBottomColor: isDark ? "#1E3050" : "#D4E8DC" }]}
        onPress={() => setSelectedJuz(null)}
      >
        <LinearGradient colors={["#0D5C3A","#1A8A5A"]} style={styles.juzBackIcon}>
          <Feather name="chevron-left" size={16} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.juzBackText, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>Juz {selectedJuz}</Text>
        <Text style={[styles.juzBackSub, { color: isDark ? "#64748B" : "#6B8C7A" }]}>Tap a Surah to read</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#10B981" size="large" />
          <Text style={[styles.loadingText, { color: isDark ? "#64748B" : "#6B8C7A" }]}>Loading Juz {selectedJuz}...</Text>
        </View>
      ) : (
        <FlatList
          data={juzSurahs ?? []}
          keyExtractor={item => String(item.surah.number)}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item, index }) => {
            const colorPair = SURAH_COLORS[item.surah.number % SURAH_COLORS.length]!;
            return (
              <TouchableOpacity
                style={[styles.surahRow, { borderBottomColor: isDark ? "#1E3050" : "#E5F0EA" }]}
                onPress={() => router.push(`/surah/${item.surah.number}` as any)}
                activeOpacity={0.7}
              >
                <LinearGradient colors={colorPair as [string,string]} style={styles.numBadge}>
                  <Text style={styles.numText}>{item.surah.number}</Text>
                </LinearGradient>
                <View style={styles.surahInfo}>
                  <Text style={[styles.surahName, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>{item.surah.englishName}</Text>
                  <Text style={[styles.surahMeta, { color: isDark ? "#64748B" : "#6B8C7A" }]}>
                    Ayahs {item.firstAyah}–{item.lastAyah} in this Juz
                  </Text>
                </View>
                <Text style={[styles.arabicName, { color: colorPair[0] }]}>{item.surah.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

function buildSurahAyahMap(surahs: ApiSurah[]): number[] {
  let total = 0;
  return surahs.map(s => { total += s.numberOfAyahs; return total; });
}

function globalAyahToSurah(globalNum: number, boundaries: number[]): number {
  for (let i = 0; i < boundaries.length; i++) {
    if (globalNum <= boundaries[i]!) return i + 1;
  }
  return 1;
}

export default function QuranScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress, bookmarks } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isDark = colors.background === "#0B1A2E";

  const { data: surahs, isLoading, isError, refetch } = useQuranSurahs();
  const totalAyahs = surahs ? surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0) : 6236;
  const boundaries = surahs ? buildSurahAyahMap(surahs) : [];

  const filtered = (surahs ?? []).filter(
    s => s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      String(s.number).includes(search)
  );

  const displayed = activeTab === 2
    ? filtered.filter(s => bookmarks.some(b => globalAyahToSurah(b, boundaries) === s.number))
    : filtered;

  // Animated tab indicator
  const tabAnim = useRef(new Animated.Value(0)).current;
  const switchTab = (i: number) => {
    setActiveTab(i);
    Animated.spring(tabAnim, { toValue: i, useNativeDriver: true, tension: 80, friction: 10 }).start();
  };
  const tabIndicatorX = tabAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, (SCREEN_W - 40) / 3, ((SCREEN_W - 40) / 3) * 2] });

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? "#060E1A" : "#F0F7F2" }]}>
      {/* HEADER */}
      <LinearGradient
        colors={isDark ? ["#0D2137","#0F3D2A"] : ["#0D5C3A","#1A8A5A"]}
        style={[styles.header, { paddingTop: topPadding + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Al-Quran</Text>
            <Text style={styles.subtitle}>
              {surahs ? `${surahs.length} Surahs • 30 Juz • ${totalAyahs.toLocaleString()} Ayahs` : "Loading..."}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {isLoading && <ActivityIndicator color="rgba(255,255,255,0.7)" />}
            {isError && (
              <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
                <Feather name="refresh-cw" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => router.push("/search" as any)}
            >
              <Feather name="search" size={15} color="#FFFFFF" />
              <Text style={styles.searchBtnText}>Search Ayahs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        {activeTab !== 1 && (
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, number..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={search}
              onChangeText={setSearch}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Feather name="x-circle" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Animated Tab Bar */}
        <View style={styles.tabRow}>
          <Animated.View style={[styles.tabIndicator, { transform: [{ translateX: tabIndicatorX }], width: (SCREEN_W - 40) / 3 }]} />
          {TABS.map((tab, i) => (
            <TouchableOpacity key={tab} style={styles.tabItem} onPress={() => switchTab(i)}>
              <Text style={[styles.tabText, { color: activeTab === i ? "#FFFFFF" : "rgba(255,255,255,0.5)" }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* CONTENT */}
      {activeTab === 1 ? (
        <JuzView />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={item => String(item.number)}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item, index }) => (
            <AnimatedSurahRow
              item={item}
              index={index}
              onPress={() => router.push(`/surah/${item.number}` as any)}
              progress={progress.surahs[item.number]?.progress}
            />
          )}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              {isLoading ? (
                <>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={[styles.emptyText, { color: isDark ? "#64748B" : "#6B8C7A" }]}>Loading surahs...</Text>
                </>
              ) : activeTab === 2 ? (
                <>
                  <View style={[styles.emptyIcon, { backgroundColor: isDark ? "#0F1E30" : "#F0FAF5" }]}>
                    <Feather name="bookmark" size={32} color="#10B981" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>No Bookmarks Yet</Text>
                  <Text style={[styles.emptyText, { color: isDark ? "#64748B" : "#6B8C7A" }]}>
                    Bookmark ayahs while reading to find them here.
                  </Text>
                </>
              ) : (
                <>
                  <View style={[styles.emptyIcon, { backgroundColor: isDark ? "#0F1E30" : "#F0FAF5" }]}>
                    <Feather name="search" size={32} color="#10B981" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: isDark ? "#F1F5F9" : "#0A1E0F" }]}>No Surahs Found</Text>
                  <Text style={[styles.emptyText, { color: isDark ? "#64748B" : "#6B8C7A" }]}>Try a different search term.</Text>
                </>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  /* Header */
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 2 },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  searchBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  searchBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },

  /* Search box */
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#FFFFFF" },

  /* Tabs */
  tabRow: { flexDirection: "row", position: "relative" },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  tabIndicator: { position: "absolute", bottom: 0, height: 3, backgroundColor: "#FFFFFF", borderRadius: 2 },

  /* Surah row */
  surahRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
  numBadge: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  surahInfo: { flex: 1, gap: 3 },
  surahName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  surahMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  progressBar: { height: 3, borderRadius: 2, overflow: "hidden", marginTop: 5 },
  progressFill: { height: "100%", borderRadius: 2 },
  arabicWrap: { alignItems: "flex-end", gap: 4 },
  arabicName: { fontSize: 20, fontWeight: "400" },
  revBadge: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  revText: { fontSize: 9, fontFamily: "Inter_700Bold" },

  /* Juz grid */
  juzCard: { flex: 1, alignItems: "center", padding: 16, borderRadius: 20, borderWidth: 1, gap: 8 },
  juzCardBadge: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  juzCardNum: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  juzCardName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  juzCardArabic: { fontSize: 14, fontWeight: "400" },

  /* Juz detail back */
  juzBackRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  juzBackIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  juzBackText: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1 },
  juzBackSub: { fontSize: 12, fontFamily: "Inter_400Regular" },

  /* Misc */
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingTop: 60 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
});

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useQuranSurahs } from "@/hooks/useQuranSurahs";
import { ApiSurah, fetchJuzAyahs } from "@/services/quranApi";

const TABS = ["Surah", "Juz", "Bookmarks"];

const JUZ_DATA = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  name: `Juz ${i + 1}`,
  arabicName: `الجزء ${i + 1}`,
}));

function SurahItem({ item, onPress, progress, isBookmarked }: {
  item: ApiSurah;
  onPress: () => void;
  progress?: number;
  isBookmarked?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.surahRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.numBadge, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.numText, { color: colors.primary }]}>{item.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <View style={styles.surahNameRow}>
          <Text style={[styles.surahName, { color: colors.foreground }]}>{item.englishName}</Text>
          {isBookmarked && <Feather name="bookmark" size={12} color={colors.accent} />}
        </View>
        <Text style={[styles.surahMeta, { color: colors.mutedForeground }]}>
          {item.englishNameTranslation} • {item.numberOfAyahs} Ayahs • {item.revelationType}
        </Text>
        {progress !== undefined && progress > 0 && (
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` as any }]} />
          </View>
        )}
      </View>
      <Text style={[styles.arabicName, { color: colors.primary }]}>{item.name}</Text>
    </TouchableOpacity>
  );
}

function JuzView() {
  const colors = useColors();
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  const { data: juzSurahs, isLoading } = useQuery({
    queryKey: ["juz", selectedJuz],
    queryFn: () => fetchJuzAyahs(selectedJuz!),
    enabled: selectedJuz !== null,
    staleTime: 1000 * 60 * 60,
  });

  if (!selectedJuz) {
    return (
      <FlatList
        data={JUZ_DATA}
        keyExtractor={item => String(item.number)}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.juzRow, { borderBottomColor: colors.border }]}
            onPress={() => setSelectedJuz(item.number)}
            activeOpacity={0.7}
          >
            <View style={[styles.juzBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.juzBadgeText, { color: colors.primary }]}>{item.number}</Text>
            </View>
            <View style={styles.juzInfo}>
              <Text style={[styles.juzName, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.juzArabic, { color: colors.primary }]}>{item.arabicName}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={[styles.juzBackRow, { backgroundColor: colors.secondary, borderBottomColor: colors.border }]}
        onPress={() => setSelectedJuz(null)}
      >
        <Feather name="chevron-left" size={18} color={colors.primary} />
        <Text style={[styles.juzBackText, { color: colors.primary }]}>Juz {selectedJuz}</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading Juz {selectedJuz}...</Text>
        </View>
      ) : (
        <FlatList
          data={juzSurahs ?? []}
          keyExtractor={item => String(item.surah.number)}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No data available for this Juz</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.surahRow, { borderBottomColor: colors.border }]}
              onPress={() => router.push(`/surah/${item.surah.number}` as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.numBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.numText, { color: colors.primary }]}>{item.surah.number}</Text>
              </View>
              <View style={styles.surahInfo}>
                <Text style={[styles.surahName, { color: colors.foreground }]}>{item.surah.englishName}</Text>
                <Text style={[styles.surahMeta, { color: colors.mutedForeground }]}>
                  Ayahs {item.firstAyah}–{item.lastAyah} in this Juz
                </Text>
              </View>
              <Text style={[styles.arabicName, { color: colors.primary }]}>{item.surah.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

export default function QuranScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress, bookmarks } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: surahs, isLoading, isError, refetch } = useQuranSurahs();

  const filtered = (surahs ?? []).filter(
    (s) =>
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      String(s.number).includes(search)
  );

  const displayed =
    activeTab === 2
      ? filtered.filter((s) => bookmarks.some((b) => Math.floor(b / 1000) === s.number))
      : filtered;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Al-Quran</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {surahs ? `${surahs.length} Surahs • 30 Juz • 6,236 Ayahs` : "Loading..."}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {isLoading && <ActivityIndicator color={colors.primary} />}
            {isError && (
              <TouchableOpacity onPress={() => refetch()}>
                <Feather name="refresh-cw" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.searchIconBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => router.push("/search" as any)}
            >
              <Feather name="search" size={16} color={colors.primary} />
              <Text style={[styles.searchIconBtnText, { color: colors.primary }]}>Search Ayahs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab !== 1 && (
          <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search by name or number..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === i && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab(i)}
            >
              <Text style={[styles.tabText, { color: activeTab === i ? "#FFFFFF" : colors.mutedForeground }]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 1 ? (
        <JuzView />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => String(item.number)}
          renderItem={({ item }) => (
            <SurahItem
              item={item}
              onPress={() => router.push(`/surah/${item.number}` as any)}
              progress={progress.surahs[item.number]?.progress}
              isBookmarked={bookmarks.some((b) => Math.floor(b / 1000) === item.number)}
            />
          )}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              {isLoading ? (
                <>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    Loading surahs from Quran API...
                  </Text>
                </>
              ) : activeTab === 2 ? (
                <>
                  <Feather name="bookmark" size={32} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    No bookmarks yet. Bookmark ayahs while reading.
                  </Text>
                </>
              ) : (
                <>
                  <Feather name="search" size={32} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No surahs found</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  searchIconBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  searchIconBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  tabRow: { flexDirection: "row", borderRadius: 10, padding: 4 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  surahRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
  numBadge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  surahInfo: { flex: 1, gap: 4 },
  surahNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  surahName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  surahMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressBar: { height: 3, borderRadius: 2, overflow: "hidden", marginTop: 4 },
  progressFill: { height: "100%", borderRadius: 2 },
  arabicName: { fontSize: 20, fontWeight: "400" },
  empty: { alignItems: "center", paddingTop: 60, gap: 14 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 30 },
  juzRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, gap: 14 },
  juzBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  juzBadgeText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  juzInfo: { flex: 1 },
  juzName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  juzArabic: { fontSize: 18, fontWeight: "400", marginTop: 2 },
  juzBackRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  juzBackText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingTop: 40 },
});

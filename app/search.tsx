import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { FlashList as ShopifyFlashList, ListRenderItemInfo } from "@shopify/flash-list";
const TypedFlashList = ShopifyFlashList as any;
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { searchQuran, SearchResult, TRANSLATION_OPTIONS } from "@/services/quranApi";

function highlight(text: string, query: string): Array<{ text: string; bold: boolean }> {
  if (!query.trim()) return [{ text, bold: false }];
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return [{ text, bold: false }];
  return [
    { text: text.slice(0, idx), bold: false },
    { text: text.slice(idx, idx + query.length), bold: true },
    { text: text.slice(idx + query.length), bold: false },
  ];
}

function ResultCard({
  item,
  query,
  colors,
}: {
  item: SearchResult;
  query: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const parts = highlight(item.translationText, query);

  return (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/surah/${item.surahNumber}` as any);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.resultHeader}>
        <View style={[styles.ayahBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.ayahBadgeText, { color: colors.primary }]}>
            {item.ayahNumber}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.surahName, { color: colors.foreground }]}>
            {item.surahEnglishName}
          </Text>
          <Text style={[styles.surahMeta, { color: colors.mutedForeground }]}>
            {item.surahTranslation} · {item.surahNumber}:{item.ayahNumber}
          </Text>
        </View>
        <Text style={[styles.arabicName, { color: colors.primary }]}>
          {item.surahArabicName}
        </Text>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>

      <Text style={[styles.translationText, { color: colors.foreground }]} numberOfLines={3}>
        {parts.map((part, i) =>
          part.bold ? (
            <Text key={i} style={[styles.bold, { backgroundColor: colors.primary + "25", color: colors.primary }]}>
              {part.text}
            </Text>
          ) : (
            <Text key={i}>{part.text}</Text>
          )
        )}
      </Text>
    </TouchableOpacity>
  );
}

const POPULAR_SEARCHES = [
  "mercy", "patience", "prayer", "paradise", "guidance",
  "forgiveness", "grateful", "trust in Allah", "righteous",
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en.asad");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const doSearch = useCallback(async (q: string, lang: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchQuran(q.trim(), lang);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text, selectedLang), 600);
  };

  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    if (query.trim()) doSearch(query, lang);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPadding + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search Quran by meaning or keyword..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleChange}
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query, selectedLang)}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {!!query && (
            <TouchableOpacity onPress={clearSearch}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Translation selector ── */}
      <View style={[styles.langBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.langLabel, { color: colors.mutedForeground }]}>Search in:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TRANSLATION_OPTIONS.filter(t => ["en.asad", "en.sahih", "ur.ahmedali", "fr.hamidullah", "id.indonesian", "tr.diyanet", "de.bubenheim"].includes(t.id))}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 6, paddingRight: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.langChip,
                {
                  backgroundColor: selectedLang === item.edition ? colors.primary + "15" : colors.muted,
                  borderColor: selectedLang === item.edition ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleLangChange(item.edition);
              }}
            >
              <Text style={styles.langFlag}>{item.flag}</Text>
              <Text style={[styles.langChipText, { color: selectedLang === item.edition ? colors.primary : colors.mutedForeground }]}>
                {item.label.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>Searching the Quran...</Text>
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.centerState}>
          <Feather name="search" size={40} color={colors.border} />
          <Text style={[styles.stateTitle, { color: colors.foreground }]}>No results found</Text>
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
            Try different keywords or switch to another translation language
          </Text>
        </View>
      ) : results.length > 0 ? (
        // @ts-ignore
        <TypedFlashList
          data={results}
          keyExtractor={(item: any, idx: number) => `${item.surahNumber}:${item.ayahNumber}:${idx}`}
          estimatedItemSize={120}
          contentContainerStyle={[styles.listContent, { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 30 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsSummary}>
              <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
              </Text>
            </View>
          }
          renderItem={({ item }: any) => (
            <ResultCard item={item} query={query} colors={colors} />
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.secondary }]}>
            <Feather name="book-open" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Search the Quran</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Find any ayah by its meaning, theme, or keyword across all 6,236 verses
          </Text>

          <View style={styles.popularSection}>
            <Text style={[styles.popularLabel, { color: colors.mutedForeground }]}>Popular searches</Text>
            <View style={styles.popularChips}>
              {POPULAR_SEARCHES.map(term => (
                <TouchableOpacity
                  key={term}
                  style={[styles.popularChip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setQuery(term);
                    doSearch(term, selectedLang);
                  }}
                >
                  <Feather name="search" size={11} color={colors.primary} />
                  <Text style={[styles.popularChipText, { color: colors.primary }]}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
              Tip: Search for themes like "patience", "mercy", or "paradise" to find related ayahs
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  langBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  langLabel: { fontSize: 12, fontFamily: "Inter_500Medium", flexShrink: 0 },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  langFlag: { fontSize: 14 },
  langChipText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 30 },
  stateTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  stateText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  listContent: { padding: 16, gap: 10 },
  resultsSummary: { marginBottom: 4 },
  resultCount: { fontSize: 12, fontFamily: "Inter_500Medium" },
  resultCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  ayahBadge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ayahBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  surahName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  surahMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  arabicName: { fontSize: 18, fontWeight: "400" },
  translationText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 22 },
  bold: { fontFamily: "Inter_700Bold", borderRadius: 3 },
  emptyState: { flex: 1, alignItems: "center", padding: 28, gap: 14 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, maxWidth: 300 },
  popularSection: { width: "100%", gap: 10, marginTop: 8 },
  popularLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  popularChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  popularChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  popularChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  tipBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 6, width: "100%" },
  tipText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});

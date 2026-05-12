import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

import { useColors } from "@/hooks/useColors";
import {
  HADITH_COLLECTIONS,
  SAMPLE_HADITHS,
  fetchHadiths,
  Hadith,
  HadithCollection,
} from "@/services/hadithApi";

export default function HadithScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCollection, setSelectedCollection] = useState(HADITH_COLLECTIONS[0]);
  const [bookNumber, setBookNumber] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: hadiths, isLoading, isError, refetch } = useQuery({
    queryKey: ["hadiths", selectedCollection.edition, bookNumber],
    queryFn: () => fetchHadiths(selectedCollection.edition, bookNumber),
    staleTime: 1000 * 60 * 60,
    placeholderData: SAMPLE_HADITHS,
    retry: 2,
  });

  const filtered = (hadiths ?? SAMPLE_HADITHS).filter(h =>
    h.body.toLowerCase().includes(search.toLowerCase()) ||
    String(h.number).includes(search)
  );

  const toggleBookmark = (n: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBookmarked(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.foreground }]}>Hadith Collections</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {selectedCollection.name} • Book {bookNumber}
            </Text>
          </View>
          {isLoading && <ActivityIndicator color={colors.primary} />}
          {isError && (
            <TouchableOpacity onPress={() => refetch()}>
              <Feather name="refresh-cw" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Collection selector */}
        <FlatList
          horizontal
          data={HADITH_COLLECTIONS}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collectionList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.collectionChip,
                {
                  backgroundColor: selectedCollection.id === item.id ? item.color : colors.muted,
                  borderColor: selectedCollection.id === item.id ? item.color : colors.border,
                },
              ]}
              onPress={() => { setSelectedCollection(item); setBookNumber(1); }}
            >
              <Text style={[
                styles.collectionChipText,
                { color: selectedCollection.id === item.id ? "#FFFFFF" : colors.mutedForeground },
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Book navigation */}
        <View style={styles.bookNav}>
          <TouchableOpacity
            style={[styles.bookNavBtn, { backgroundColor: colors.muted }]}
            onPress={() => setBookNumber(n => Math.max(1, n - 1))}
            disabled={bookNumber === 1}
          >
            <Feather name="chevron-left" size={16} color={bookNumber === 1 ? colors.border : colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.bookNavText, { color: colors.foreground }]}>
            Book {bookNumber} of {selectedCollection.books}
          </Text>
          <TouchableOpacity
            style={[styles.bookNavBtn, { backgroundColor: colors.muted }]}
            onPress={() => setBookNumber(n => Math.min(selectedCollection.books, n + 1))}
            disabled={bookNumber >= selectedCollection.books}
          >
            <Feather name="chevron-right" size={16} color={bookNumber >= selectedCollection.books ? colors.border : colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search hadiths..."
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
      </View>

      {/* Stats bar */}
      <LinearGradient
        colors={[selectedCollection.color, selectedCollection.color + "CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.statsBar}
      >
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{selectedCollection.totalHadiths.toLocaleString()}</Text>
          <Text style={styles.statLbl}>Total Hadiths</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{selectedCollection.books}</Text>
          <Text style={styles.statLbl}>Books</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{filtered.length}</Text>
          <Text style={styles.statLbl}>This Book</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{bookmarked.length}</Text>
          <Text style={styles.statLbl}>Saved</Text>
        </View>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={item => `${item.collection}-${item.bookNumber}-${item.number}`}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Loading hadiths...
                </Text>
              </>
            ) : (
              <>
                <Feather name="book" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No hadiths found
                </Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const isOpen = expandedId === item.number;
          const isSaved = bookmarked.includes(item.number);

          return (
            <TouchableOpacity
              style={[styles.hadithCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedId(isOpen ? null : item.number);
              }}
              activeOpacity={0.85}
            >
              {/* Hadith number badge */}
              <View style={styles.hadithHeader}>
                <View style={[styles.hadithNum, { backgroundColor: selectedCollection.color }]}>
                  <Text style={styles.hadithNumText}>{item.number}</Text>
                </View>
                <View style={styles.hadithMeta}>
                  <Text style={[styles.hadithRef, { color: colors.mutedForeground }]}>
                    {item.reference ?? `${selectedCollection.name} • Book ${item.bookNumber}`}
                  </Text>
                </View>
                <View style={styles.hadithActions}>
                  <TouchableOpacity
                    onPress={() => toggleBookmark(item.number)}
                    style={styles.actionIcon}
                  >
                    <Feather
                      name="bookmark"
                      size={16}
                      color={isSaved ? colors.accent : colors.mutedForeground}
                    />
                  </TouchableOpacity>
                  <Feather
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </View>
              </View>

              <Text
                style={[styles.hadithBody, { color: colors.foreground }]}
                numberOfLines={isOpen ? undefined : 4}
              >
                {item.body}
              </Text>

              {isOpen && (
                <View style={[styles.hadithFooter, { borderTopColor: colors.border }]}>
                  <View style={[styles.collectionTag, { backgroundColor: selectedCollection.color + "15" }]}>
                    <View style={[styles.collectionDot, { backgroundColor: selectedCollection.color }]} />
                    <Text style={[styles.collectionTagText, { color: selectedCollection.color }]}>
                      {selectedCollection.name}
                    </Text>
                  </View>
                  <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.muted }]}>
                    <Feather name="share-2" size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  collectionList: { gap: 8, paddingBottom: 12 },
  collectionChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  collectionChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  bookNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  bookNavBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  bookNavText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  statsBar: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 20 },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statNum: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  statLbl: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 4 },
  hadithCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, marginBottom: 12 },
  hadithHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  hadithNum: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  hadithNumText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  hadithMeta: { flex: 1 },
  hadithRef: { fontSize: 11, fontFamily: "Inter_400Regular" },
  hadithActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionIcon: { padding: 4 },
  hadithBody: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 24 },
  hadithFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTopWidth: 1 },
  collectionTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  collectionDot: { width: 6, height: 6, borderRadius: 3 },
  collectionTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  shareBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 14 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});

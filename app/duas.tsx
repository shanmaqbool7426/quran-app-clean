import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DUA_CATEGORIES, DUAS } from "@/constants/duas";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

export default function DuasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCat, setSelectedCat] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const categories = ["All", ...DUA_CATEGORIES];
  const filtered = selectedCat === "All" ? DUAS : DUAS.filter(d => d.category === selectedCat);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={[styles.header, { paddingTop: topPadding + 16 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Dua Collection</Text>
          <Text style={styles.subtitle}>{DUAS.length} daily supplications</Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Feather name="book-open" size={20} color="#FFFFFF" />
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={[styles.filterContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.catChip,
                { 
                  backgroundColor: selectedCat === item ? colors.primary : colors.muted,
                  borderColor: selectedCat === item ? colors.primary : colors.border
                }
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedCat(item);
              }}
            >
              <Text style={[styles.catText, { color: selectedCat === item ? "#FFFFFF" : colors.mutedForeground }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20, padding: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.duaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.duaHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.duaInfo}>
                <Text style={[styles.duaTitle, { color: colors.primary }]}>{item.title}</Text>
                <View style={[styles.catTag, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.catTagText, { color: colors.primary }]}>{item.category}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.shareBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <Feather name="share-2" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.arabicContainer, { backgroundColor: colors.primary + "08" }]}>
              <Text style={[styles.duaArabic, { color: colors.foreground }]}>{item.arabic}</Text>
            </View>

            <View style={styles.duaContent}>
              <Text style={[styles.duaTranslit, { color: colors.foreground }]}>{item.transliteration}</Text>
              <Text style={[styles.duaTrans, { color: colors.mutedForeground }]}>{item.translation}</Text>
              
              {item.reference && (
                <View style={[styles.refTag, { backgroundColor: colors.muted }]}>
                  <Feather name="bookmark" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.refText, { color: colors.mutedForeground }]}>{item.reference}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingBottom: 24, 
    gap: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: { 
    padding: 8, 
    backgroundColor: "rgba(255,255,255,0.2)", 
    borderRadius: 12 
  },
  headerTextWrap: { flex: 1 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  headerIconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center"
  },
  filterContainer: { borderBottomWidth: 1, paddingVertical: 12 },
  catList: { paddingHorizontal: 20, gap: 10 },
  catChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 24, 
    marginRight: 4,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  duaCard: { 
    borderRadius: 20, 
    borderWidth: 1, 
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  duaHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  duaInfo: { flex: 1, gap: 6, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  duaTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  catTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  catTagText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase" },
  shareBtn: { padding: 8 },
  arabicContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  duaArabic: { 
    fontSize: 26, 
    lineHeight: 46, 
    textAlign: "center", 
    writingDirection: "rtl",
    fontFamily: "Inter_400Regular" // Or an Arabic specific font if loaded
  },
  duaContent: { padding: 18, gap: 12 },
  duaTranslit: { fontSize: 15, fontFamily: "Inter_500Medium", fontStyle: "italic", lineHeight: 22 },
  duaTrans: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  refTag: { 
    flexDirection: "row", 
    gap: 6, 
    alignItems: "center", 
    paddingVertical: 6,
    paddingHorizontal: 10, 
    borderRadius: 8, 
    alignSelf: "flex-start",
    marginTop: 4
  },
  refText: { fontSize: 12, fontFamily: "Inter_500Medium" },
});

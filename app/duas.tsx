import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DUA_CATEGORIES, DUAS } from "@/constants/duas";
import { useColors } from "@/hooks/useColors";

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
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Dua Collection</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{DUAS.length} daily supplications</Text>
        </View>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.catList, { borderBottomColor: colors.border }]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, { backgroundColor: selectedCat === item ? colors.primary : colors.muted }]}
            onPress={() => setSelectedCat(item)}
          >
            <Text style={[styles.catText, { color: selectedCat === item ? "#FFFFFF" : colors.mutedForeground }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20, padding: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isOpen = expanded === item.id;
          return (
            <TouchableOpacity
              style={[styles.duaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpanded(isOpen ? null : item.id);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.duaHeader}>
                <View style={styles.duaInfo}>
                  <Text style={[styles.duaTitle, { color: colors.foreground }]}>{item.title}</Text>
                  <View style={[styles.catTag, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.catTagText, { color: colors.primary }]}>{item.category}</Text>
                  </View>
                </View>
                <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
              </View>

              <Text style={[styles.duaArabic, { color: colors.foreground }]} numberOfLines={isOpen ? undefined : 2}>
                {item.arabic}
              </Text>

              {isOpen && (
                <View style={styles.duaExpanded}>
                  <Text style={[styles.duaTranslit, { color: colors.primary }]}>{item.transliteration}</Text>
                  <Text style={[styles.duaTrans, { color: colors.mutedForeground }]}>{item.translation}</Text>
                  {item.reference && (
                    <View style={[styles.refTag, { backgroundColor: colors.muted }]}>
                      <Feather name="book" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.refText, { color: colors.mutedForeground }]}>Source: {item.reference}</Text>
                    </View>
                  )}
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 14 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  catList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderBottomWidth: 1 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 4 },
  catText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  duaCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  duaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  duaInfo: { flex: 1, gap: 6 },
  duaTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  catTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  catTagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  duaArabic: { fontSize: 20, fontWeight: "400", lineHeight: 38, textAlign: "right", writingDirection: "rtl", color: "#000" },
  duaExpanded: { gap: 10 },
  duaTranslit: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  duaTrans: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  refTag: { flexDirection: "row", gap: 6, alignItems: "center", padding: 8, borderRadius: 8, alignSelf: "flex-start" },
  refText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});

import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Surah } from "@/constants/quranData";
import { useColors } from "@/hooks/useColors";

interface Props {
  surah: Surah;
  onPress: () => void;
  progress?: number;
  isBookmarked?: boolean;
}

export default function SurahRow({ surah, onPress, progress, isBookmarked }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.numberBadge, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.number, { color: colors.primary }]}>{surah.id}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.foreground }]}>{surah.name}</Text>
          <Text style={[styles.arabicName, { color: colors.primary }]}>{surah.arabicName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {surah.ayahs} verses • {surah.type}
          </Text>
          {progress !== undefined && progress > 0 && (
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` as any }]} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.right}>
        {isBookmarked && <Feather name="bookmark" size={14} color={colors.accent} style={{ marginBottom: 4 }} />}
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 14,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  arabicName: {
    fontSize: 18,
    fontWeight: "400",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    maxWidth: 80,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  right: {
    alignItems: "center",
  },
});

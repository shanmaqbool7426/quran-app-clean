import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";

export default function PrayerTimesCard() {
  const colors = useColors();
  const { prayers, nextPrayer, timeToNext, isLoading, locationName } = useRealPrayerTimes();

  if (isLoading && prayers.length === 0) {
    return (
      <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Getting prayer times...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {nextPrayer && (
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.nextPrayer}
        >
          <View>
            <Text style={styles.nextLabel}>NEXT PRAYER</Text>
            <Text style={styles.nextName}>{nextPrayer.name}</Text>
            <Text style={styles.nextArabic}>{nextPrayer.arabicName}</Text>
          </View>
          <View style={styles.nextRight}>
            <Text style={styles.nextTime}>{nextPrayer.time}</Text>
            <View style={[styles.countdownBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name="clock" size={12} color="#FFFFFF" />
              <Text style={styles.countdown}>{timeToNext}</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      <View style={styles.locationRow}>
        <Feather name="map-pin" size={12} color={colors.mutedForeground} />
        <Text style={[styles.locationText, { color: colors.mutedForeground }]}>{locationName}</Text>
      </View>

      <View style={styles.prayerList}>
        {prayers.map((prayer, i) => (
          <View
            key={prayer.name}
            style={[
              styles.prayerRow,
              i < prayers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              prayer.isNext && { backgroundColor: colors.secondary, borderRadius: 10, paddingHorizontal: 8 },
            ]}
          >
            <View style={styles.prayerLeft}>
              {prayer.isNext ? (
                <View style={[styles.nextDot, { backgroundColor: colors.primary }]} />
              ) : prayer.passed ? (
                <Feather name="check" size={12} color={colors.mutedForeground} />
              ) : (
                <View style={[styles.dot, { backgroundColor: colors.border }]} />
              )}
              <Text style={[
                styles.prayerArabic,
                { color: prayer.isNext ? colors.primary : prayer.passed ? colors.mutedForeground : colors.foreground }
              ]}>
                {prayer.arabicName}
              </Text>
              <Text style={[
                styles.prayerName,
                { color: prayer.isNext ? colors.primary : prayer.passed ? colors.mutedForeground : colors.foreground }
              ]}>
                {prayer.name}
              </Text>
            </View>
            <Text style={[
              styles.prayerTime,
              { color: prayer.isNext ? colors.primary : prayer.passed ? colors.mutedForeground : colors.foreground },
              prayer.isNext && { fontFamily: "Inter_700Bold" }
            ]}>
              {prayer.time}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  loadingCard: { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, padding: 30, alignItems: "center", gap: 12 },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  nextPrayer: { padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nextLabel: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, textTransform: "uppercase" },
  nextName: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 2 },
  nextArabic: { color: "rgba(255,255,255,0.85)", fontSize: 18, fontWeight: "400", marginTop: 2 },
  nextRight: { alignItems: "flex-end", gap: 8 },
  nextTime: { color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold" },
  countdownBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countdown: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 16, paddingVertical: 8 },
  locationText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  prayerList: { paddingBottom: 8 },
  prayerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 11 },
  prayerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  nextDot: { width: 8, height: 8, borderRadius: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  prayerArabic: { fontSize: 16, fontWeight: "400" },
  prayerName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  prayerTime: { fontSize: 14, fontFamily: "Inter_500Medium" },
});

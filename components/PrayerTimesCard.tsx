import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";
import {
  cancelPrayerNotifications,
  schedulePrayerNotifications,
  shouldLoadExpoNotificationsModule,
} from "@/services/notificationService";

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌅", Dhuhr: "☀️", Asr: "🌤️", Maghrib: "🌇", Isha: "🌙",
};

function parse24(time24: string): { h: number; m: number } {
  const [hStr, mStr] = time24.split(":");
  return { h: parseInt(hStr ?? "0"), m: parseInt(mStr ?? "0") };
}

export default function PrayerTimesCard() {
  const colors = useColors();
  const isDark = colors.background === "#0B1A2E";
  const { prayers, nextPrayer, timeToNext, isLoading, locationName } = useRealPrayerTimes();
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // Pulsing glow for next prayer row
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Countdown tick every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // Entry animation
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(entryY, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleToggleNotif = async () => {
    if (!shouldLoadExpoNotificationsModule() && Platform.OS !== "web") {
      Alert.alert("Not available", "Prayer notifications require a development build.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifLoading(true);
    try {
      if (notifEnabled) {
        await cancelPrayerNotifications();
        setNotifEnabled(false);
        Alert.alert("Notifications Off", "Prayer time reminders have been cancelled.");
      } else {
        const prayerData = prayers
          .filter(p => p.time24)
          .map(p => {
            const { h, m } = parse24(p.time24 ?? "00:00");
            return { name: p.name, arabicName: p.arabicName, hour: h, minute: m };
          });
        const success = await schedulePrayerNotifications(prayerData);
        if (success) {
          setNotifEnabled(true);
          Alert.alert("✅ Notifications On", "You'll be reminded 5 minutes before each prayer time every day.");
        } else {
          Alert.alert("Permission Denied", "Please allow notifications in your phone settings to receive prayer reminders.");
        }
      }
    } finally {
      setNotifLoading(false);
    }
  };

  if (isLoading && prayers.length === 0) {
    return (
      <View style={[styles.loadingCard, { backgroundColor: isDark ? "#0F1E30" : "#FFFFFF", borderColor: isDark ? "#1E3050" : "#D4E8DC" }]}>
        <ActivityIndicator color="#10B981" size="small" />
        <Text style={[styles.loadingText, { color: isDark ? "#64748B" : "#6B8C7A" }]}>Getting prayer times...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.card, {
      backgroundColor: isDark ? "#0F1E30" : "#FFFFFF",
      borderColor: isDark ? "#1E3050" : "#D4E8DC",
      opacity: entryOpacity,
      transform: [{ translateY: entryY }],
    }]}>
      {/* ── NEXT PRAYER BANNER ── */}
      {nextPrayer && (
        <LinearGradient
          colors={isDark ? ["#0D3B2A","#0D5C3A"] : ["#0D5C3A","#1A8A5A"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.nextBanner}
        >
          {/* Decorative rings */}
          {[...Array(3)].map((_, i) => (
            <View key={i} style={[styles.bannerRing, {
              width: 60 + i * 40, height: 60 + i * 40,
              borderRadius: (60 + i * 40) / 2,
              right: -10, bottom: -10,
              borderColor: `rgba(255,255,255,${0.1 - i * 0.03})`,
            }]} />
          ))}
          <View style={styles.nextLeft}>
            <View style={styles.nextLabelRow}>
              <Animated.View style={[styles.nextDotLive, { opacity: glowAnim, backgroundColor: "#4ADE80" }]} />
              <Text style={styles.nextLabel}>NEXT PRAYER</Text>
            </View>
            <Text style={styles.nextEmoji}>{PRAYER_ICONS[nextPrayer.name] ?? "🕌"}</Text>
            <Text style={styles.nextName}>{nextPrayer.name}</Text>
            <Text style={styles.nextArabic}>{nextPrayer.arabicName}</Text>
          </View>
          <View style={styles.nextRight}>
            <Text style={styles.nextTime}>{nextPrayer.time}</Text>
            <View style={styles.countdownBadge}>
              <Feather name="clock" size={11} color="rgba(255,255,255,0.85)" />
              <Text style={styles.countdownText}>{timeToNext}</Text>
            </View>
            {/* Notification toggle button */}
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: notifEnabled ? "#4ADE80" : "rgba(255,255,255,0.2)" }]}
              onPress={handleToggleNotif}
              disabled={notifLoading}
            >
              {notifLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name={notifEnabled ? "bell" : "bell-off"} size={13} color="#FFFFFF" />
                  <Text style={styles.notifBtnText}>{notifEnabled ? "On" : "Remind"}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}

      {/* ── LOCATION ROW ── */}
      <View style={[styles.locationRow, { borderBottomColor: isDark ? "#1E3050" : "#E5F0EA" }]}>
        <Feather name="map-pin" size={12} color="#10B981" />
        <Text style={[styles.locationText, { color: isDark ? "#64748B" : "#6B8C7A" }]}>{locationName}</Text>
        <Text style={[styles.locationText, { color: isDark ? "#475569" : "#94A3B8" }]}>• Auto-detected</Text>
      </View>

      {/* ── PRAYER LIST ── */}
      <View style={styles.prayerList}>
        {prayers.map((prayer, i) => {
          const isPassed = prayer.passed && !prayer.isNext;
          const isNext = prayer.isNext;
          const emoji = PRAYER_ICONS[prayer.name] ?? "🕌";

          return (
            <Animated.View
              key={prayer.name}
              style={[
                styles.prayerRow,
                i < prayers.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? "#1E3050" : "#F0F7F2" },
                isNext && {
                  backgroundColor: isDark ? "#0D3B2A" : "#E6FBF3",
                  borderLeftWidth: 3,
                  borderLeftColor: "#10B981",
                },
              ]}
            >

              {/* Status indicator */}
              <View style={styles.statusCol}>
                {isPassed ? (
                  <View style={[styles.checkCircle, { backgroundColor: isDark ? "#1E3050" : "#F0FAF5" }]}>
                    <Feather name="check" size={10} color="#10B981" />
                  </View>
                ) : isNext ? (
                  <Animated.View style={[styles.nextIndicator, { opacity: glowAnim, backgroundColor: "#10B981" }]} />
                ) : (
                  <View style={[styles.futureCircle, { borderColor: isDark ? "#334155" : "#D4E8DC" }]} />
                )}
              </View>

              {/* Emoji */}
              <Text style={styles.prayerEmoji}>{emoji}</Text>

              {/* Prayer name */}
              <View style={styles.prayerInfo}>
                <Text style={[styles.prayerName, {
                  color: isNext ? "#10B981" : isPassed ? (isDark ? "#475569" : "#94A3B8") : (isDark ? "#F1F5F9" : "#0A1E0F"),
                  fontFamily: isNext ? "Inter_700Bold" : "Inter_500Medium",
                }]}>
                  {prayer.name}
                </Text>
                <Text style={[styles.prayerArabic, {
                  color: isNext ? "#10B981" : isPassed ? (isDark ? "#334155" : "#CBD5E1") : (isDark ? "#64748B" : "#6B8C7A"),
                }]}>
                  {prayer.arabicName}
                </Text>
              </View>

              {/* Time + badge */}
              <View style={styles.timeCol}>
                <Text style={[styles.prayerTime, {
                  color: isNext ? "#10B981" : isPassed ? (isDark ? "#475569" : "#94A3B8") : (isDark ? "#F1F5F9" : "#0A1E0F"),
                  fontFamily: isNext ? "Inter_700Bold" : "Inter_500Medium",
                }]}>
                  {prayer.time}
                </Text>
                {isNext && (
                  <View style={styles.nextTimeBadge}>
                    <Text style={styles.nextTimeBadgeText}>NEXT</Text>
                  </View>
                )}
                {isPassed && (
                  <Text style={[styles.passedText, { color: isDark ? "#334155" : "#CBD5E1" }]}>Done</Text>
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, borderRadius: 22, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  loadingCard: { marginHorizontal: 20, borderRadius: 22, borderWidth: 1, padding: 30, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular" },

  /* Next banner */
  nextBanner: { padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", overflow: "hidden" },
  bannerRing: { position: "absolute", borderWidth: 1 },
  nextLeft: { gap: 2 },
  nextLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  nextDotLive: { width: 7, height: 7, borderRadius: 4 },
  nextLabel: { color: "rgba(255,255,255,0.75)", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.2, textTransform: "uppercase" },
  nextEmoji: { fontSize: 22, marginBottom: 2 },
  nextName: { color: "#FFFFFF", fontSize: 22, fontFamily: "Inter_700Bold" },
  nextArabic: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "400" },
  nextRight: { alignItems: "flex-end", gap: 8 },
  nextTime: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_700Bold" },
  countdownBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countdownText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  notifBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  notifBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_700Bold" },

  /* Location */
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1 },
  locationText: { fontSize: 11, fontFamily: "Inter_400Regular" },

  /* Prayer list */
  prayerList: { paddingBottom: 4 },
  prayerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 10, position: "relative", overflow: "hidden" },
  statusCol: { width: 20, alignItems: "center" },
  checkCircle: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  nextIndicator: { width: 10, height: 10, borderRadius: 5 },
  futureCircle: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  prayerEmoji: { fontSize: 18, width: 24, textAlign: "center" },
  prayerInfo: { flex: 1, gap: 1 },
  prayerName: { fontSize: 14 },
  prayerArabic: { fontSize: 13, fontWeight: "400" },
  timeCol: { alignItems: "flex-end", gap: 3 },
  prayerTime: { fontSize: 14 },
  nextTimeBadge: { backgroundColor: "#10B98122", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  nextTimeBadgeText: { color: "#10B981", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  passedText: { fontSize: 10, fontFamily: "Inter_400Regular" },
});

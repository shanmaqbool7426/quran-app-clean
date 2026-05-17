import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PrayerTimesCard from "@/components/PrayerTimesCard";
import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";

const { width: SCREEN_W } = Dimensions.get("window");

const TOOLS = [
  { icon: "navigation" as const, label: "Qibla",      subtitle: "Find direction",     bg: ["#D97706","#F59E0B"] as [string,string], route: "/qibla" },
  { icon: "repeat" as const,     label: "Tasbeeh",    subtitle: "Digital counter",    bg: ["#7C3AED","#A855F7"] as [string,string], route: "/tasbeeh" },
  { icon: "book-open" as const,  label: "Duas",       subtitle: "Supplications",      bg: ["#0D5C3A","#10B981"] as [string,string], route: "/duas" },
  { icon: "book" as const,       label: "Hadith",     subtitle: "6 collections",      bg: ["#2563EB","#3B82F6"] as [string,string], route: "/hadith" },
  { icon: "percent" as const,    label: "Zakat",      subtitle: "Calculator",         bg: ["#D97706","#EAB308"] as [string,string], route: "/zakat" },
  { icon: "map-pin" as const,    label: "Mosque",     subtitle: "Finder nearby",      bg: ["#DC2626","#F87171"] as [string,string], route: "/mosque" },
  { icon: "cpu" as const,        label: "AI Scholar", subtitle: "Islamic Q&A",        bg: ["#6D28D9","#8B5CF6"] as [string,string], route: "/ai-chat" },
  { icon: "trending-up" as const,label: "Hifz Plan",  subtitle: "Memorize Quran",     bg: ["#059669","#34D399"] as [string,string], route: "/memorize" },
];

function ToolCard({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const colors = useColors();
  const isDark = colors.background === "#0B1A2E";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay: index * 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressIn = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }], width: (SCREEN_W - 52) / 2 }}>
      <TouchableOpacity
        onPress={() => router.push(tool.route as any)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={isDark ? [tool.bg[0] + "40", tool.bg[1] + "20"] : [tool.bg[0] + "18", tool.bg[1] + "10"]}
          style={[styles.toolCard, { borderColor: tool.bg[0] + (isDark ? "55" : "33") }]}
        >
          <LinearGradient colors={tool.bg} style={styles.toolIconBg}>
            <Feather name={tool.icon} size={24} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.toolLabel, { color: isDark ? "#F1F5F9" : "#111827" }]}>{tool.label}</Text>
          <Text style={[styles.toolSub, { color: tool.bg[0] }]}>{tool.subtitle}</Text>
          <View style={[styles.toolArrow, { backgroundColor: tool.bg[0] + "22" }]}>
            <Feather name="arrow-right" size={12} color={tool.bg[0]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { hijriDate, hijriMonth, hijriYear, gregorianDate } = useRealPrayerTimes();
  const isDark = colors.background === "#0B1A2E";

  const displayDate = hijriDate && hijriMonth
    ? `${hijriDate} ${hijriMonth} ${hijriYear} AH`
    : (() => {
        const today = new Date();
        const hijriMonths = ["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhu al-Qidah","Dhu al-Hijjah"];
        return `${((today.getDate() + 9) % 30) + 1} ${hijriMonths[today.getMonth()] ?? "Ramadan"} 1446 AH`;
      })();

  // Header animation
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);
  const headerTranslate = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });

  // Pulse animation for moon icon
  const moonPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonPulse, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
        Animated.timing(moonPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? "#060E1A" : "#F0F7F2" }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <LinearGradient
          colors={isDark ? ["#0D2137","#0A1A2E"] : ["#0D5C3A","#1A8A5A"]}
          style={[styles.header, { paddingTop: topPadding + 20 }]}
        >
          <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }}>
            <Text style={styles.headerTitle}>Islamic Tools</Text>
            <Text style={styles.headerSub}>Your complete spiritual companion</Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Hijri Date Banner */}
          <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }}>
            <LinearGradient
              colors={["#92400E","#D97706","#F59E0B"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.dateBanner}
            >
              {/* Decorative rings */}
              {[...Array(3)].map((_, i) => (
                <View key={i} style={[styles.dateRing, {
                  width: 60 + i * 40, height: 60 + i * 40,
                  borderRadius: (60 + i * 40) / 2,
                  right: -15 + i * 5, bottom: -15 + i * 5,
                  borderColor: `rgba(255,255,255,${0.1 - i * 0.02})`,
                }]} />
              ))}
              <View style={{ flex: 1 }}>
                <View style={styles.dateTopRow}>
                  <View style={styles.dateLabelBadge}>
                    <Feather name="moon" size={10} color="#F59E0B" />
                    <Text style={styles.dateLabel}>HIJRI DATE</Text>
                  </View>
                </View>
                <Text style={styles.dateValue}>{displayDate}</Text>
                {gregorianDate && <Text style={styles.dateSub}>{gregorianDate}</Text>}
              </View>
              <Animated.View style={{ transform: [{ scale: moonPulse }] }}>
                <Text style={styles.moonEmoji}>🌙</Text>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          {/* Prayer Times */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>🕌 Prayer Times</Text>
            <PrayerTimesCard />
          </View>

          {/* Tools Grid */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? "#E2E8F0" : "#0A1E0F" }]}>✨ Tools & Features</Text>
            <View style={styles.toolGrid}>
              {TOOLS.map((tool, i) => (
                <ToolCard key={tool.label} tool={tool} index={i} />
              ))}
            </View>
          </View>

          {/* AI Banner */}
          <LinearGradient
            colors={["#1E0545","#3B0764","#4C1D95"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.aiCard}
          >
            {[...Array(3)].map((_, i) => (
              <View key={i} style={[styles.aiRing, {
                width: 80 + i * 50, height: 80 + i * 50,
                borderRadius: (80 + i * 50) / 2,
                right: -20, top: -20,
                borderColor: `rgba(168,85,247,${0.15 - i * 0.04})`,
              }]} />
            ))}
            <LinearGradient colors={["#7C3AED","#A855F7"]} style={styles.aiIconCircle}>
              <Feather name="cpu" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.aiCardRight}>
              <View style={styles.aiBadge}>
                <View style={styles.aiBadgeDot} />
                <Text style={styles.aiBadgeText}>AI POWERED</Text>
              </View>
              <Text style={styles.aiTitle}>Islamic AI Scholar</Text>
              <Text style={styles.aiSub}>Ask anything — Quran, Hadith, Fiqh & more</Text>
              <TouchableOpacity
                style={styles.aiBtn}
                onPress={() => router.push("/ai-chat" as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.aiBtnText}>Start Conversation</Text>
                <Feather name="arrow-right" size={13} color="#7C3AED" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 4 },
  content: { padding: 16, gap: 24 },

  /* Date Banner */
  dateBanner: { borderRadius: 22, padding: 20, flexDirection: "row", alignItems: "center", overflow: "hidden", gap: 12 },
  dateRing: { position: "absolute", borderWidth: 1 },
  dateTopRow: { marginBottom: 8 },
  dateLabelBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  dateLabel: { color: "rgba(255,255,255,0.9)", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  dateValue: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  dateSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  moonEmoji: { fontSize: 44 },

  section: { gap: 14 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },

  /* Tool Cards */
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  toolCard: { borderRadius: 20, padding: 16, borderWidth: 1, gap: 8, overflow: "hidden" },
  toolIconBg: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  toolLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  toolSub: { fontSize: 11, fontFamily: "Inter_500Medium" },
  toolArrow: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },

  /* AI Card */
  aiCard: { borderRadius: 22, padding: 20, flexDirection: "row", alignItems: "center", gap: 16, overflow: "hidden" },
  aiRing: { position: "absolute", borderWidth: 1 },
  aiIconCircle: { width: 64, height: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  aiCardRight: { flex: 1, gap: 8 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(168,85,247,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  aiBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#A855F7" },
  aiBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#C4B5FD", letterSpacing: 1 },
  aiTitle: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold" },
  aiSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  aiBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" },
  aiBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#7C3AED" },
});

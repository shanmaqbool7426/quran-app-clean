import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PrayerTimesCard from "@/components/PrayerTimesCard";
import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";

const TOOLS = [
  { icon: "navigation" as const, label: "Qibla", subtitle: "Find direction", color: "#C8972A", route: "/qibla" },
  { icon: "repeat" as const, label: "Tasbeeh", subtitle: "Digital counter", color: "#8B5CF6", route: "/tasbeeh" },
  { icon: "book-open" as const, label: "Duas", subtitle: "Collection", color: "#0D5C3A", route: "/duas" },
  { icon: "book" as const, label: "Hadith", subtitle: "6 major collections", color: "#2563EB", route: "/hadith" },
  { icon: "dollar-sign" as const, label: "Zakat", subtitle: "Calculator", color: "#D97706", route: "/zakat" },
  { icon: "map-pin" as const, label: "Mosque", subtitle: "Finder", color: "#DC2626", route: "/mosque" },
  { icon: "cpu" as const, label: "AI Scholar", subtitle: "Islamic Q&A", color: "#8B5CF6", route: "/ai-chat" },
  { icon: "trending-up" as const, label: "Hifz Plan", subtitle: "Memorize Quran", color: "#22C55E", route: "/memorize" },
];

export default function ToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { hijriDate, hijriMonth, hijriYear, gregorianDate } = useRealPrayerTimes();

  const displayDate = hijriDate && hijriMonth
    ? `${hijriDate} ${hijriMonth} ${hijriYear} AH`
    : (() => {
        const today = new Date();
        const hijriDay = ((today.getDate() + 9) % 30) + 1;
        const hijriMonths = ["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhu al-Qidah","Dhu al-Hijjah"];
        const hijriMonthName = hijriMonths[today.getMonth()] ?? "Ramadan";
        return `${hijriDay} ${hijriMonthName} 1446 AH`;
      })();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Islamic Tools</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Your spiritual companion</Text>
        </View>

        <View style={styles.content}>
          <LinearGradient
            colors={[colors.accent, "#D4A840"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.dateBanner, { borderRadius: colors.radius }]}
          >
            <View>
              <Text style={styles.dateLabel}>Hijri Date</Text>
              <Text style={styles.dateValue}>{displayDate}</Text>
              {gregorianDate ? <Text style={styles.dateSub}>{gregorianDate}</Text> : null}
            </View>
            <Feather name="moon" size={44} color="rgba(255,255,255,0.3)" />
          </LinearGradient>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Prayer Times</Text>
            <PrayerTimesCard />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Tools & Features</Text>
            <View style={styles.toolGrid}>
              {TOOLS.map(tool => (
                <TouchableOpacity
                  key={tool.label}
                  style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(tool.route as any)}
                  activeOpacity={0.75}
                >
                  <LinearGradient
                    colors={[tool.color + "20", tool.color + "10"]}
                    style={[styles.toolIconBg, { borderRadius: 16 }]}
                  >
                    <Feather name={tool.icon} size={26} color={tool.color} />
                  </LinearGradient>
                  <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
                  <Text style={[styles.toolSub, { color: colors.mutedForeground }]}>{tool.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <LinearGradient
            colors={["#1A0533", "#3B0764"]}
            style={[styles.aiCard, { borderRadius: colors.radius }]}
          >
            <View style={styles.aiCardLeft}>
              <View style={[styles.aiBadge, { backgroundColor: "#8B5CF6" }]}>
                <Feather name="cpu" size={12} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>AI POWERED</Text>
              </View>
              <Text style={styles.aiTitle}>Islamic AI Scholar</Text>
              <Text style={styles.aiSub}>Ask any Islamic question — Quran, Hadith, Fiqh, history</Text>
              <TouchableOpacity
                style={styles.aiBtn}
                onPress={() => router.push("/ai-chat" as any)}
              >
                <Text style={styles.aiBtnText}>Start Conversation</Text>
                <Feather name="arrow-right" size={14} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
            <View style={[styles.aiIconWrap, { backgroundColor: "rgba(139,92,246,0.2)" }]}>
              <Feather name="cpu" size={36} color="#8B5CF6" />
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  content: { padding: 20, gap: 20 },
  dateBanner: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 1 },
  dateValue: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 4 },
  dateSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  toolCard: { width: "47%", alignItems: "center", padding: 18, borderRadius: 16, borderWidth: 1, gap: 10 },
  toolIconBg: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  toolLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toolSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  aiCard: { padding: 20, flexDirection: "row", alignItems: "center", gap: 16 },
  aiCardLeft: { flex: 1, gap: 10 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  aiBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1 },
  aiTitle: { color: "#FFFFFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  aiSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  aiBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" },
  aiBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8B5CF6" },
  aiIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
});

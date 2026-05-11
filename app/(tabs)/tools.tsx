import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AIScholarIcon,
  DuasIcon,
  HadithIcon,
  HifzIcon,
  MosqueIcon,
  QiblaIcon,
  TasbeehIcon,
  ZakatIcon,
} from "@/components/IslamicIcons";
import PrayerTimesCard from "@/components/PrayerTimesCard";
import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";

const TOOLS = [
  {
    Icon: QiblaIcon,
    label: "Qibla",
    subtitle: "Find direction",
    color: "#C8972A",
    route: "/qibla",
    bgLight: ["#FDF3DC", "#FBE8B0"] as [string, string],
    bgDark: ["#2A2010", "#1E1808"] as [string, string],
  },
  {
    Icon: TasbeehIcon,
    label: "Tasbeeh",
    subtitle: "Digital counter",
    color: "#8B5CF6",
    route: "/tasbeeh",
    bgLight: ["#F3EDFF", "#E8DCFF"] as [string, string],
    bgDark: ["#1E1533", "#170F28"] as [string, string],
  },
  {
    Icon: DuasIcon,
    label: "Duas",
    subtitle: "Collection",
    color: "#0D5C3A",
    route: "/duas",
    bgLight: ["#E8F5EE", "#CDE9DA"] as [string, string],
    bgDark: ["#0D2018", "#091510"] as [string, string],
  },
  {
    Icon: HadithIcon,
    label: "Hadith",
    subtitle: "6 major collections",
    color: "#2563EB",
    route: "/hadith",
    bgLight: ["#EBF0FF", "#D5E2FF"] as [string, string],
    bgDark: ["#0D1533", "#090F28"] as [string, string],
  },
  {
    Icon: ZakatIcon,
    label: "Zakat",
    subtitle: "Calculator",
    color: "#D97706",
    route: "/zakat",
    bgLight: ["#FEF3E2", "#FDE6C0"] as [string, string],
    bgDark: ["#261808", "#1A1005"] as [string, string],
  },
  {
    Icon: MosqueIcon,
    label: "Mosque",
    subtitle: "Finder",
    color: "#DC2626",
    route: "/mosque",
    bgLight: ["#FEE9E9", "#FDD5D5"] as [string, string],
    bgDark: ["#280A0A", "#1A0505"] as [string, string],
  },
  {
    Icon: AIScholarIcon,
    label: "AI Scholar",
    subtitle: "Islamic Q&A",
    color: "#8B5CF6",
    route: "/ai-chat",
    bgLight: ["#F3EDFF", "#E8DCFF"] as [string, string],
    bgDark: ["#1E1533", "#170F28"] as [string, string],
  },
  {
    Icon: HifzIcon,
    label: "Hifz Plan",
    subtitle: "Memorize Quran",
    color: "#22C55E",
    route: "/memorize",
    bgLight: ["#E9FBF0", "#CDF5DC"] as [string, string],
    bgDark: ["#0A2014", "#061509"] as [string, string],
  },
];

export default function ToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const isDark = colors.background === "#0B1A2E";
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
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={[styles.header, { paddingTop: topPadding + 16 }]}
        >
          <Text style={styles.headerTitle}>Islamic Tools</Text>
          <Text style={styles.headerSub}>Your spiritual companion</Text>

          <View style={[styles.dateBanner, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <View>
              <Text style={styles.dateLabel}>Hijri Date</Text>
              <Text style={styles.dateValue}>{displayDate}</Text>
              {gregorianDate ? <Text style={styles.dateSub}>{gregorianDate}</Text> : null}
            </View>
            <View style={styles.moonWrap}>
              <Text style={styles.moonEmoji}>🌙</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
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
                    colors={isDark ? tool.bgDark : tool.bgLight}
                    style={styles.toolIconBg}
                  >
                    <tool.Icon size={34} color={tool.color} />
                  </LinearGradient>
                  <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
                  <Text style={[styles.toolSub, { color: colors.mutedForeground }]}>{tool.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/ai-chat" as any)} activeOpacity={0.88}>
            <LinearGradient
              colors={["#1A0533", "#3B0764"]}
              style={styles.aiCard}
            >
              <View style={styles.aiLeft}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>✦ AI POWERED</Text>
                </View>
                <Text style={styles.aiTitle}>Islamic AI Scholar</Text>
                <Text style={styles.aiSub}>Ask any Islamic question — Quran, Hadith, Fiqh, history</Text>
                <View style={styles.aiBtn}>
                  <Text style={styles.aiBtnText}>Start Conversation →</Text>
                </View>
              </View>
              <View style={styles.aiIconWrap}>
                <AIScholarIcon size={44} color="#C4B5FD" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2, marginBottom: 16 },
  dateBanner: { borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 1 },
  dateValue: { color: "#FFFFFF", fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 4 },
  dateSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  moonWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  moonEmoji: { fontSize: 28 },
  content: { padding: 20, gap: 24 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  toolCard: {
    width: "47%",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toolIconBg: { width: 68, height: 68, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  toolLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toolSub: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  aiCard: { padding: 22, flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 20 },
  aiLeft: { flex: 1, gap: 10 },
  aiBadge: { backgroundColor: "#8B5CF6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  aiBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1 },
  aiTitle: { color: "#FFFFFF", fontSize: 19, fontFamily: "Inter_700Bold" },
  aiSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  aiBtn: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" },
  aiBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8B5CF6" },
  aiIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(139,92,246,0.2)", alignItems: "center", justifyContent: "center" },
});

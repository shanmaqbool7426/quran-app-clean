import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, ImageSourcePropType, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ZakatIcon } from "@/components/IslamicIcons";
import PrayerTimesCard from "@/components/PrayerTimesCard";
import { useColors } from "@/hooks/useColors";
import { useRealPrayerTimes } from "@/hooks/useRealPrayerTimes";

const TOOLS: Array<{
  image?: ImageSourcePropType;
  useSvg?: boolean;
  label: string;
  subtitle: string;
  color: string;
  accent: string;
  route: string;
}> = [
  {
    image: require("@/assets/images/tools/qibla_icon.png"),
    label: "Qibla",
    subtitle: "Find direction",
    color: "#C8972A",
    accent: "#FDF3DC",
    route: "/qibla",
  },
  {
    image: require("@/assets/images/tools/tasbeeh.png"),
    label: "Tasbeeh",
    subtitle: "Digital counter",
    color: "#8B5CF6",
    accent: "#F3EDFF",
    route: "/tasbeeh",
  },
  {
    image: require("@/assets/images/tools/duas_icon.png"),
    label: "Duas",
    subtitle: "Collection",
    color: "#0D5C3A",
    accent: "#E8F5EE",
    route: "/duas",
  },
  {
    image: require("@/assets/images/tools/hadith.png"),
    label: "Hadith",
    subtitle: "6 major collections",
    color: "#2563EB",
    accent: "#EBF0FF",
    route: "/hadith",
  },
  {
    useSvg: true,
    label: "Zakat",
    subtitle: "Calculator",
    color: "#D97706",
    accent: "#FEF3E2",
    route: "/zakat",
  },
  {
    image: require("@/assets/images/tools/mosque.png"),
    label: "Mosque",
    subtitle: "Finder",
    color: "#DC2626",
    accent: "#FEE9E9",
    route: "/mosque",
  },
  {
    image: require("@/assets/images/tools/ai-scholar.png"),
    label: "AI Scholar",
    subtitle: "Islamic Q&A",
    color: "#8B5CF6",
    accent: "#F3EDFF",
    route: "/ai-chat",
  },
  {
    image: require("@/assets/images/tools/ai-scholar2.png"),
    label: "Hifz Plan",
    subtitle: "Memorize Quran",
    color: "#22C55E",
    accent: "#E9FBF0",
    route: "/memorize",
  },
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
                  activeOpacity={0.8}
                >
                  {tool.useSvg ? (
                    <View style={[styles.toolIconWrap, { backgroundColor: tool.accent }]}>
                      <ZakatIcon size={40} color={tool.color} />
                    </View>
                  ) : (
                    <View style={[styles.toolIconWrap, { backgroundColor: tool.accent, overflow: "hidden" }]}>
                      <Image
                        source={tool.image!}
                        style={styles.toolImage}
                        resizeMode="cover"
                      />
                      <View style={[styles.toolImageOverlay, { borderColor: tool.color + "30" }]} />
                    </View>
                  )}
                  <View style={styles.toolMeta}>
                    <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
                    <Text style={[styles.toolSub, { color: colors.mutedForeground }]}>{tool.subtitle}</Text>
                  </View>
                  <View style={[styles.toolArrow, { backgroundColor: tool.color + "15" }]}>
                    <Text style={[styles.toolArrowText, { color: tool.color }]}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/ai-chat" as any)} activeOpacity={0.88}>
            <View style={styles.aiCardWrap}>
              <Image
                source={require("@/assets/images/tools/ai-scholar.png")}
                style={styles.aiCardBg}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["rgba(15,5,40,0.75)", "rgba(58,7,100,0.92)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.aiContent}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>✦ AI POWERED</Text>
                </View>
                <Text style={styles.aiTitle}>Islamic AI Scholar</Text>
                <Text style={styles.aiSub}>Ask any Islamic question — Quran, Hadith, Fiqh, history</Text>
                <View style={styles.aiBtn}>
                  <Text style={styles.aiBtnText}>Start Conversation →</Text>
                </View>
              </View>
            </View>
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
  toolGrid: { gap: 10 },
  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toolIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  toolImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  toolImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
  },
  toolMeta: { flex: 1, gap: 3 },
  toolLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  toolSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  toolArrow: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  toolArrowText: { fontSize: 20, fontFamily: "Inter_600SemiBold", marginTop: -2 },
  aiCardWrap: { height: 160, borderRadius: 22, overflow: "hidden", justifyContent: "flex-end" },
  aiCardBg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  aiContent: { padding: 20, gap: 8 },
  aiBadge: { backgroundColor: "#8B5CF6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  aiBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1 },
  aiTitle: { color: "#FFFFFF", fontSize: 19, fontFamily: "Inter_700Bold" },
  aiSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Inter_400Regular" },
  aiBtn: { backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, alignSelf: "flex-start" },
  aiBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8B5CF6" },
});

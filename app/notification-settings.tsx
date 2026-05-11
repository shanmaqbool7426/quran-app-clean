import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  cancelDailyReminder,
  formatTime,
  getPermissionStatus,
  NotificationPrefs,
  PermissionStatus,
  requestNotificationPermission,
  scheduleDailyReminder,
  sendTestNotification,
} from "@/services/notificationService";
import { DAILY_AYAHS } from "@/constants/quranData";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = [0, 15, 30, 45];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function displayHour(h: number) {
  const v = h % 12;
  return v === 0 ? 12 : v;
}

function NotifPreviewCard({ title, body, colors }: {
  title: string;
  body: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.015, useNativeDriver: true, speed: 30, bounciness: 6 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }),
    ]).start();
  }, [title, body]);

  return (
    <Animated.View
      style={[
        styles.previewCard,
        { backgroundColor: colors.card, borderColor: colors.border, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.previewHeader}>
        <View style={[styles.previewAppIcon, { backgroundColor: colors.primary }]}>
          <Text style={styles.previewAppIconText}>☪</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.previewAppName, { color: colors.mutedForeground }]}>Al-Quran App · now</Text>
        </View>
        <Feather name="bell" size={14} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.previewTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.previewBody, { color: colors.mutedForeground }]} numberOfLines={3}>
        {body}
      </Text>
    </Animated.View>
  );
}

export default function NotificationSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { notificationPrefs, setNotificationPrefs } = useApp();

  const [enabled, setEnabled] = useState(notificationPrefs.enabled);
  const [hour, setHour] = useState(notificationPrefs.hour);
  const [minute, setMinute] = useState(notificationPrefs.minute);
  const [permStatus, setPermStatus] = useState<PermissionStatus>("undetermined");
  const [saving, setSaving] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const todayAyah = DAILY_AYAHS[new Date().getDate() % DAILY_AYAHS.length];
  const notifTitle = `🌙 Daily Ayah — ${todayAyah?.reference ?? "Al-Quran"}`;
  const notifBody = `"${todayAyah?.translation ?? "Guide us to the straight path"}"`;

  useEffect(() => {
    getPermissionStatus().then(setPermStatus);
  }, []);

  useEffect(() => {
    const changed =
      enabled !== notificationPrefs.enabled ||
      hour !== notificationPrefs.hour ||
      minute !== notificationPrefs.minute;
    setHasChanges(changed);
  }, [enabled, hour, minute, notificationPrefs]);

  const handleToggle = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (val && permStatus !== "granted" && permStatus !== "web") {
      const status = await requestNotificationPermission();
      setPermStatus(status);
      if (status !== "granted" && status !== "web") {
        if (Platform.OS !== "web") {
          Alert.alert(
            "Permission Required",
            "Please enable notifications for this app in your device settings.",
            [{ text: "OK" }]
          );
        }
        return;
      }
    }
    setEnabled(val);
  };

  const handleSave = async () => {
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prefs: NotificationPrefs = { enabled, hour, minute };
    setNotificationPrefs(prefs);
    if (enabled) {
      await scheduleDailyReminder(prefs, notifTitle, notifBody);
    } else {
      await cancelDailyReminder();
    }
    setSaving(false);
    setHasChanges(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleTest = async () => {
    setTestLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (permStatus !== "granted" && permStatus !== "web") {
      const status = await requestNotificationPermission();
      setPermStatus(status);
    }

    const success = await sendTestNotification(notifTitle, notifBody);
    setTestLoading(false);

    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } else if (Platform.OS === "web") {
      Alert.alert(
        "Web Preview",
        "On mobile, this would send a real push notification in 3 seconds. Enable browser notifications if you'd like to test on web.",
        [{ text: "OK" }]
      );
    }
  };

  const isWeb = Platform.OS === "web";

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Daily Reminder</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview card */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Notification Preview</Text>
          <NotifPreviewCard title={notifTitle} body={notifBody} colors={colors} />
          <Text style={[styles.previewNote, { color: colors.mutedForeground }]}>
            Each day shows a different ayah — this is today's
          </Text>
        </View>

        {/* Enable toggle */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.toggleIcon, { backgroundColor: enabled ? colors.primary + "20" : colors.muted }]}>
                <Feather name="bell" size={20} color={enabled ? colors.primary : colors.mutedForeground} />
              </View>
              <View>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Daily Reminder</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                  {enabled
                    ? `Notifies you at ${formatTime(hour, minute)}`
                    : "Get a daily ayah reminder"}
                </Text>
              </View>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {isWeb && (
            <View style={[styles.webNotice, { backgroundColor: colors.secondary, borderColor: colors.primary + "30" }]}>
              <Feather name="smartphone" size={14} color={colors.primary} />
              <Text style={[styles.webNoticeText, { color: colors.mutedForeground }]}>
                Background reminders work on the iOS and Android app. On web, reminders are shown when you open the app.
              </Text>
            </View>
          )}
        </View>

        {/* Time picker — shown when enabled */}
        {enabled && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Reminder Time</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Current time display */}
              <View style={styles.timeDisplay}>
                <Text style={[styles.timeLarge, { color: colors.foreground }]}>
                  {displayHour(hour)}
                  <Text style={[styles.timeColon, { color: colors.primary }]}>:</Text>
                  {pad(minute)}
                </Text>
                <Text style={[styles.timeAmPm, { color: colors.primary }]}>
                  {hour >= 12 ? "PM" : "AM"}
                </Text>
              </View>

              {/* Hour picker */}
              <Text style={[styles.pickerLabel, { color: colors.mutedForeground }]}>Hour</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerRow}
              >
                {HOURS.map(h => {
                  const selected = h === hour;
                  const display = displayHour(h);
                  const amPm = h >= 12 ? "PM" : "AM";
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.pickerChip,
                        {
                          backgroundColor: selected ? colors.primary : colors.muted,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setHour(h);
                      }}
                    >
                      <Text style={[styles.pickerChipText, { color: selected ? "#FFFFFF" : colors.foreground }]}>
                        {display}
                      </Text>
                      <Text style={[styles.pickerAmPm, { color: selected ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
                        {amPm}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Minute picker */}
              <Text style={[styles.pickerLabel, { color: colors.mutedForeground }]}>Minutes</Text>
              <View style={styles.minuteRow}>
                {MINUTE_OPTIONS.map(m => {
                  const selected = m === minute;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.minuteChip,
                        {
                          backgroundColor: selected ? colors.primary : colors.muted,
                          borderColor: selected ? colors.primary : colors.border,
                          flex: 1,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setMinute(m);
                      }}
                    >
                      <Text style={[styles.minuteChipText, { color: selected ? "#FFFFFF" : colors.foreground }]}>
                        :{pad(m)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Common times */}
              <Text style={[styles.pickerLabel, { color: colors.mutedForeground }]}>Quick pick</Text>
              <View style={styles.quickTimeRow}>
                {[
                  { label: "Fajr", h: 5, m: 0 },
                  { label: "Morning", h: 7, m: 0 },
                  { label: "Midday", h: 12, m: 0 },
                  { label: "Evening", h: 18, m: 0 },
                  { label: "Night", h: 21, m: 0 },
                ].map(t => {
                  const selected = t.h === hour && t.m === minute;
                  return (
                    <TouchableOpacity
                      key={t.label}
                      style={[
                        styles.quickChip,
                        {
                          backgroundColor: selected ? colors.primary + "20" : colors.muted,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setHour(t.h);
                        setMinute(t.m);
                      }}
                    >
                      <Text style={[styles.quickChipText, { color: selected ? colors.primary : colors.foreground }]}>
                        {t.label}
                      </Text>
                      <Text style={[styles.quickChipTime, { color: colors.mutedForeground }]}>
                        {formatTime(t.h, t.m)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.section}>
          {hasChanges && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {enabled ? `Save · Remind me at ${formatTime(hour, minute)}` : "Save · Reminders off"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.testBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleTest}
            disabled={testLoading}
          >
            {testLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : testSent ? (
              <>
                <Feather name="check-circle" size={16} color="#10B981" />
                <Text style={[styles.testBtnText, { color: "#10B981" }]}>
                  {isWeb ? "Sent!" : "Arriving in 3 seconds..."}
                </Text>
              </>
            ) : (
              <>
                <Feather name="send" size={16} color={colors.primary} />
                <Text style={[styles.testBtnText, { color: colors.primary }]}>
                  Send Test Notification
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={15} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Each day you'll receive a different ayah from a curated collection of 30 meaningful verses. Tap it to open the full surah.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, alignItems: "flex-start" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", textAlign: "center" },
  content: { padding: 20, gap: 20 },
  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  previewHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewAppIcon: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  previewAppIconText: { fontSize: 12, color: "#FFFFFF" },
  previewAppName: { fontSize: 11, fontFamily: "Inter_500Medium" },
  previewTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  previewBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
  previewNote: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  toggleIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  toggleLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  webNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  webNoticeText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  timeDisplay: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: 6, paddingVertical: 20 },
  timeLarge: { fontSize: 56, fontFamily: "Inter_700Bold", lineHeight: 64 },
  timeColon: { fontSize: 56, fontFamily: "Inter_700Bold" },
  timeAmPm: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  pickerLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 4 },
  pickerRow: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  pickerChip: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  pickerChipText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  pickerAmPm: { fontSize: 9, fontFamily: "Inter_500Medium" },
  minuteRow: { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  minuteChip: { height: 48, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  minuteChipText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  quickTimeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 2,
  },
  quickChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  quickChipTime: { fontSize: 10, fontFamily: "Inter_400Regular" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16 },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  testBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 16, borderWidth: 1 },
  testBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 16, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});

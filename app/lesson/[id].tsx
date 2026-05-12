import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Speech from "expo-speech";

import { LESSON_DATA } from "@/constants/qaida";
import { useColors } from "@/hooks/useColors";
import { useQaidaProgress } from "@/hooks/useQaidaProgress";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isLessonUnlocked, isLessonComplete, markLessonComplete, unlockHint } = useQaidaProgress();
  const [saving, setSaving] = React.useState(false);

  const lessonId = id ?? "";
  const lesson = LESSON_DATA[lessonId];
  const unlocked = isLessonUnlocked(lessonId);
  const complete = isLessonComplete(lessonId);
  const hint = unlockHint(lessonId);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const speak = (text: string) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ar-SA";
        synth.speak(utterance);
      }
    } else {
      Speech.speak(text, { language: "ar-SA", rate: 0.8 });
    }
  };

  if (!lesson) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>Lesson not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!unlocked) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground, flex: 1 }]}>Locked</Text>
        </View>
        <View style={styles.lockedBody}>
          <View style={[styles.lockedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={40} color={colors.mutedForeground} />
            <Text style={[styles.lockedTitle, { color: colors.foreground }]}>{lesson.title}</Text>
            <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>
              {hint ?? "Complete earlier lessons on the Learn tab to unlock this one."}
            </Text>
            <TouchableOpacity
              style={[styles.backCta, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={styles.backCtaText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const onMarkComplete = async () => {
    if (complete || saving) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await markLessonComplete(lessonId);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.title, { color: colors.foreground }]}>{lesson.title}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{lesson.description}</Text>
        </View>
      </View>

      <FlatList
        key={`lesson-grid-${lessonId}`}
        data={lesson.items}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 120,
          gap: 12,
        }}
        columnWrapperStyle={{ gap: 12 }}
        ListFooterComponent={
          <View style={[styles.footerCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {complete ? (
              <>
                <Feather name="check-circle" size={22} color="#10B981" />
                <Text style={[styles.footerTitle, { color: colors.foreground }]}>Lesson completed</Text>
                <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>
                  Great work. The next lesson is unlocked from the Learn tab.
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.footerTitle, { color: colors.foreground }]}>Finished studying?</Text>
                <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>
                  Mark complete to unlock the next lesson in order.
                </Text>
                <TouchableOpacity
                  onPress={onMarkComplete}
                  disabled={saving}
                  activeOpacity={0.85}
                  style={styles.markBtnWrap}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.markBtn}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="check" size={18} color="#FFFFFF" />
                        <Text style={styles.markBtnText}>Mark lesson complete</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => speak(item.arabic)}
            activeOpacity={0.7}
          >
            <Text style={[styles.itemArabic, { color: colors.foreground }]}>{item.arabic}</Text>
            <Text style={[styles.itemTranslit, { color: colors.primary }]}>{item.transliteration}</Text>
            {item.meaning && (
              <Text style={[styles.itemMeaning, { color: colors.mutedForeground }]}>{item.meaning}</Text>
            )}
            <View style={[styles.playBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="volume-2" size={12} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitleContainer: { flex: 1 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular" },
  lockedBody: { flex: 1, padding: 24, justifyContent: "center" },
  lockedCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  lockedTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  lockedText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  backCta: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backCtaText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  itemCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    position: "relative",
  },
  itemArabic: { fontSize: 32, fontWeight: "400", marginBottom: 4 },
  itemTranslit: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  itemMeaning: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 2 },
  playBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerCard: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 8,
    alignItems: "center",
  },
  footerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  footerSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  markBtnWrap: { marginTop: 8, width: "100%" },
  markBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  markBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

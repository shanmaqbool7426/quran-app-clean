import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Speech from 'expo-speech';

import { LESSON_DATA } from "@/constants/qaida";
import { useColors } from "@/hooks/useColors";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const lesson = LESSON_DATA[id as string];

  
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!lesson) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.foreground }}>Lesson not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const speak = (text: string) => {
    if (Platform.OS === 'web') {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      synth.speak(utterance);
    } else {
      Speech.speak(text, { language: 'ar-SA', rate: 0.8 });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
        data={lesson.items}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
          gap: 12,
        }}
        columnWrapperStyle={{ gap: 12 }}
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
  itemCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    position: 'relative',
  },
  itemArabic: { fontSize: 32, fontWeight: '400', marginBottom: 4 },
  itemTranslit: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: 'center' },
  itemMeaning: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: 'center', marginTop: 2 },
  playBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

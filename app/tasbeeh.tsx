import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

import { FlatList } from "react-native";

const DHIKR_LIST = [
  { arabic: "سُبْحَانَ اللَّهِ", transliteration: "Subhan Allah", translation: "Glory be to Allah", target: 33 },
  { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "All praise to Allah", target: 33 },
  { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah is the Greatest", target: 34 },
  { arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", translation: "There is no god but Allah", target: 100 },
  { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", translation: "I seek forgiveness from Allah", target: 100 },
  { arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", translation: "There is no power except by Allah", target: 100 },
  { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "Subhanallahi wa bihamdihi", translation: "Glory and praise be to Allah", target: 100 },
  { arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", transliteration: "Allahumma salli ala Muhammad", translation: "O Allah, send blessings upon Muhammad", target: 100 },
  { arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbunallah wa ni'mal wakeel", translation: "Allah is sufficient for us", target: 100 },
  { arabic: "سُبْحَانَ الْمَلِكِ الْقُدُّوسِ", transliteration: "Subhanal Malikil Quddus", translation: "Glory be to the Sovereign, the Most Holy", target: 3 }
];

export default function TasbeehScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasbeehCount, incrementTasbeeh, resetTasbeeh } = useApp();
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const [customTargets, setCustomTargets] = useState<Record<number, number>>({});
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [tempTarget, setTempTarget] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const dhikr = DHIKR_LIST[selectedDhikr];
  const activeTarget = customTargets[selectedDhikr] || dhikr.target;
  const progress = activeTarget > 0 ? Math.min(tasbeehCount / activeTarget, 1) : 0;
  const cycles = activeTarget > 0 ? Math.floor(tasbeehCount / activeTarget) : 0;

  const handlePress = () => {
    incrementTasbeeh();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    if (activeTarget > 0 && (tasbeehCount + 1) % activeTarget === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSaveTarget = () => {
    const val = parseInt(tempTarget, 10);
    if (!isNaN(val) && val > 0) {
      setCustomTargets(prev => ({ ...prev, [selectedDhikr]: val }));
    } else {
      // If 0 or invalid, remove custom target (fallback to default, or set as free-count? Let's treat 0 as infinity)
      if (val === 0) {
        setCustomTargets(prev => ({ ...prev, [selectedDhikr]: 0 }));
      } else {
         const updated = { ...customTargets };
         delete updated[selectedDhikr];
         setCustomTargets(updated);
      }
    }
    setTargetModalVisible(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Tasbeeh Counter</Text>
        <TouchableOpacity onPress={resetTasbeeh} style={styles.resetBtn}>
          <Feather name="refresh-cw" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Dhikr selector */}
      <View style={[styles.filterContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={DHIKR_LIST}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          renderItem={({ item: d, index: i }) => (
            <TouchableOpacity
              style={[
                styles.catChip,
                { 
                  backgroundColor: selectedDhikr === i ? colors.primary : colors.muted,
                  borderColor: selectedDhikr === i ? colors.primary : colors.border
                }
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedDhikr(i);
                resetTasbeeh();
              }}
            >
              <Text style={[styles.catText, { color: selectedDhikr === i ? "#FFFFFF" : colors.mutedForeground }]}>
                {d.transliteration.split(" ").slice(0, 2).join(" ")}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.main}>
        {/* Dhikr text */}
        <View style={[styles.dhikrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.dhikrArabic, { color: colors.foreground }]}>{dhikr.arabic}</Text>
          <Text style={[styles.dhikrTranslit, { color: colors.primary }]}>{dhikr.transliteration}</Text>
          <Text style={[styles.dhikrMeaning, { color: colors.mutedForeground }]}>{dhikr.translation}</Text>
        </View>

        {/* Circular progress + count */}
        <View style={styles.counterArea}>
          <View style={styles.circleWrapper}>
            <View style={[styles.circleTrack, { borderColor: colors.border }]}>
              <View style={[styles.circleInner, { backgroundColor: colors.background }]}>
                <Text style={[styles.countNum, { color: colors.foreground }]}>
                  {activeTarget > 0 ? tasbeehCount % activeTarget : tasbeehCount}
                </Text>
                
                <TouchableOpacity 
                  style={styles.targetBtn} 
                  onPress={() => {
                    setTempTarget(activeTarget.toString());
                    setTargetModalVisible(true);
                  }}
                >
                  <Text style={[styles.countTarget, { color: colors.mutedForeground }]}>
                    {activeTarget > 0 ? `/ ${activeTarget}` : "Free Count"}
                  </Text>
                  <Feather name="edit-2" size={12} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {cycles > 0 && activeTarget > 0 && (
                  <View style={[styles.cyclesBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.cyclesText, { color: colors.primary }]}>{cycles}x</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Big tap button */}
          <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.tapBtn}
              >
                <Feather name="plus" size={36} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>Tap to count</Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` as any }]} />
        </View>

        <Text style={[styles.totalCount, { color: colors.mutedForeground }]}>
          Total: {tasbeehCount} dhikr
        </Text>
      </View>

      {/* Target Edit Modal */}
      <Modal visible={targetModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Set Target Count</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Enter 0 for Free Count (no limit)</Text>
            
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
              value={tempTarget}
              onChangeText={setTempTarget}
              keyboardType="number-pad"
              autoFocus
            />
            
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setTargetModalVisible(false)}>
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleSaveTarget}>
                <Text style={[styles.modalBtnText, { color: "#FFFFFF" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  resetBtn: { padding: 8, backgroundColor: "rgba(255,0,0,0.1)", borderRadius: 12 },
  filterContainer: { borderBottomWidth: 1, paddingVertical: 12 },
  catList: { paddingHorizontal: 20, gap: 10 },
  catChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 24, 
    marginRight: 4,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  main: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 24, gap: 24 },
  dhikrCard: { width: "100%", padding: 24, borderRadius: 20, borderWidth: 1, alignItems: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  dhikrArabic: { fontSize: 32, fontFamily: "Inter_400Regular", lineHeight: 50, textAlign: "center", writingDirection: "rtl" },
  dhikrTranslit: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  dhikrMeaning: { fontSize: 14, fontFamily: "Inter_400Regular", fontStyle: "italic", textAlign: "center" },
  counterArea: { alignItems: "center", gap: 30, flex: 1, justifyContent: "center" },
  circleWrapper: { position: "relative" },
  circleTrack: { width: 200, height: 200, borderRadius: 100, borderWidth: 8, alignItems: "center", justifyContent: "center" },
  circleInner: { width: 176, height: 176, borderRadius: 88, alignItems: "center", justifyContent: "center", gap: 4 },
  countNum: { fontSize: 56, fontFamily: "Inter_700Bold" },
  targetBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 8 },
  countTarget: { fontSize: 16, fontFamily: "Inter_500Medium" },
  cyclesBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  cyclesText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  tapBtn: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  tapHint: { fontSize: 13, fontFamily: "Inter_400Regular" },
  progressContainer: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  totalCount: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { padding: 24, borderRadius: 20, borderWidth: 1, gap: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  modalSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 18, textAlign: "center", fontFamily: "Inter_600SemiBold" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

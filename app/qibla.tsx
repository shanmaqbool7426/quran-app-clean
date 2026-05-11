import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function QiblaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [heading, setHeading] = useState(319);
  const [location, setLocation] = useState("Your Location");
  const rotateAnim = useRef(new Animated.Value(319)).current;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const QIBLA_DIRECTION = 319;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: QIBLA_DIRECTION,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  const rotateInterp = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const isAligned = Math.abs((heading % 360) - QIBLA_DIRECTION) < 10;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Qibla Direction</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.main}>
        {/* Location */}
        <View style={[styles.locationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.foreground }]}>{location}</Text>
        </View>

        {/* Compass */}
        <View style={styles.compassContainer}>
          {/* Outer ring */}
          <View style={[styles.outerRing, { borderColor: colors.border }]}>
            {/* Cardinal directions */}
            {[
              { label: "N", angle: 0, x: 0, y: -120 },
              { label: "S", angle: 180, x: 0, y: 120 },
              { label: "E", angle: 90, x: 120, y: 0 },
              { label: "W", angle: 270, x: -120, y: 0 },
            ].map(dir => (
              <View
                key={dir.label}
                style={[styles.cardinal, { top: 130 + dir.y, left: 130 + dir.x }]}
              >
                <Text style={[styles.cardinalText, { color: dir.label === "N" ? "#EF4444" : colors.mutedForeground }]}>
                  {dir.label}
                </Text>
              </View>
            ))}

            {/* Compass needle */}
            <Animated.View style={[styles.needleContainer, { transform: [{ rotate: rotateInterp }] }]}>
              <LinearGradient
                colors={[colors.accent, "#D4A840"]}
                style={styles.needle}
              >
                <Feather name="navigation" size={24} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

            {/* Center */}
            <View style={[styles.centerDot, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 18 }}>🕋</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, {
          backgroundColor: isAligned ? "#22C55E10" : colors.card,
          borderColor: isAligned ? "#22C55E40" : colors.border
        }]}>
          <View style={[styles.dirBadge, { backgroundColor: isAligned ? "#22C55E" : colors.primary }]}>
            <Text style={styles.dirNum}>{QIBLA_DIRECTION}°</Text>
            <Text style={styles.dirLabel}>NW</Text>
          </View>
          <View style={styles.dirInfo}>
            <Text style={[styles.dirTitle, { color: colors.foreground }]}>
              {isAligned ? "Facing Qibla!" : "Qibla Direction"}
            </Text>
            <Text style={[styles.dirSub, { color: colors.mutedForeground }]}>
              {isAligned ? "You are correctly facing the Kaaba" : `Face ${QIBLA_DIRECTION}° NW toward Makkah`}
            </Text>
          </View>
          {isAligned && <Feather name="check-circle" size={22} color="#22C55E" />}
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Direction based on great circle calculation toward the Holy Kaaba in Makkah Al-Mukarramah.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  main: { flex: 1, alignItems: "center", paddingHorizontal: 20, paddingTop: 24, gap: 24 },
  locationCard: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  locationText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  compassContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  outerRing: { width: 280, height: 280, borderRadius: 140, borderWidth: 2, alignItems: "center", justifyContent: "center", position: "relative" },
  cardinal: { position: "absolute", width: 24, height: 24, alignItems: "center", justifyContent: "center", marginLeft: -12, marginTop: -12 },
  cardinalText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  needleContainer: { position: "absolute", alignItems: "center", justifyContent: "center" },
  needle: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", shadowColor: "#C8972A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  centerDot: { position: "absolute", width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  infoCard: { width: "100%", flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  dirBadge: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", gap: 0 },
  dirNum: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  dirLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  dirInfo: { flex: 1 },
  dirTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  dirSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 20, marginBottom: 20 },
});

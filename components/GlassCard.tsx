import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewStyle, Platform } from "react-native";

import { useColors } from "@/hooks/useColors";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  intensity?: number;
  tint?: "light" | "dark" | "default";
}

export function GlassCard({ children, style, padding = 16, intensity = 40, tint = "light" }: GlassCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Platform.OS === "ios" ? "transparent" : (tint === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(30, 41, 59, 0.7)"),
          borderColor: tint === "light" ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.1)",
          borderRadius: 24,
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.blur, { borderRadius: 24, padding }]}
      >
        <View style={styles.inner}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  blur: {
    width: "100%",
  },
  inner: {
    width: "100%",
  },
});

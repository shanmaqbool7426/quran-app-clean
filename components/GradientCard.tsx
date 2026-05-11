import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  children: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  borderRadius?: number;
  padding?: number;
}

export default function GradientCard({
  children,
  colors: gradColors,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  borderRadius,
  padding = 20,
}: Props) {
  const colors = useColors();
  const defaultColors: readonly [string, string] = [colors.primary, colors.primaryLight];
  const finalColors = gradColors ?? defaultColors;
  const r = borderRadius ?? colors.radius;

  return (
    <LinearGradient
      colors={finalColors}
      start={start}
      end={end}
      style={[styles.gradient, { borderRadius: r, padding }, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    overflow: "hidden",
  },
});

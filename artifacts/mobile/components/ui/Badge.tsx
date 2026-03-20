import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

type BadgeProps = {
  label: string;
  color: string;
  textColor?: string;
  style?: ViewStyle;
  size?: "sm" | "md";
};

export function Badge({ label, color, textColor, style, size = "md" }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }, size === "sm" ? styles.badgeSm : styles.badgeMd, style]}>
      <Text style={[styles.text, size === "sm" ? styles.textSm : styles.textMd, { color: textColor ?? "#fff" }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  badgeSm: { paddingHorizontal: 8, paddingVertical: 2 },
  badgeMd: { paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontFamily: "Inter_600SemiBold" },
  textSm: { fontSize: 11 },
  textMd: { fontSize: 12 },
});

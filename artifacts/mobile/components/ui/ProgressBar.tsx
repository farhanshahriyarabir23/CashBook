import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import Colors from "@/constants/colors";

type ProgressBarProps = {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
};

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 6,
  style,
  animated = true,
}: ProgressBarProps) {
  const C = Colors.light;
  const anim = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    if (animated) {
      Animated.timing(anim, {
        toValue: clamped,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      anim.setValue(clamped);
    }
  }, [clamped, animated]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const barColor = color ?? C.tint;
  const isOverBudget = clamped >= 1 && color === undefined;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: backgroundColor ?? C.backgroundSecondary,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width,
            height,
            borderRadius: height / 2,
            backgroundColor: isOverBudget ? C.expense : barColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    width: "100%",
  },
  fill: {},
});

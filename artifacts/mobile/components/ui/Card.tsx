import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Colors from "@/constants/colors";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
};

export function Card({ children, style, padding = 16, elevated = false }: CardProps) {
  const C = Colors.light;
  return (
    <View
      style={[
        styles.card,
        {
          padding,
          backgroundColor: C.backgroundCard,
          shadowColor: elevated ? C.shadowMedium : C.shadow,
          shadowOpacity: elevated ? 1 : 1,
          shadowRadius: elevated ? 12 : 6,
          elevation: elevated ? 4 : 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
  },
});

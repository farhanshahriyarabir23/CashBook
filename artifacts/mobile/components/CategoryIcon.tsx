import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { TransactionCategory } from "@/context/FinanceContext";

type CategoryIconProps = {
  category: TransactionCategory;
  size?: number;
  iconSize?: number;
};

const CATEGORY_CONFIG: Record<TransactionCategory, { icon: string; bg: string; color: string; lib: string }> = {
  food: { icon: "coffee", bg: "#FEF3C7", color: "#D97706", lib: "feather" },
  transport: { icon: "navigation", bg: "#EDE9FE", color: "#7C3AED", lib: "feather" },
  entertainment: { icon: "headphones", bg: "#FCE7F3", color: "#BE185D", lib: "feather" },
  shopping: { icon: "shopping-bag", bg: "#E0F2FE", color: "#0369A1", lib: "feather" },
  housing: { icon: "home", bg: "#DCFCE7", color: "#16A34A", lib: "feather" },
  health: { icon: "heart", bg: "#FEE2E2", color: "#DC2626", lib: "feather" },
  education: { icon: "book-open", bg: "#DBEAFE", color: "#1D4ED8", lib: "feather" },
  income: { icon: "trending-up", bg: "#DCFCE7", color: "#16A34A", lib: "feather" },
  other: { icon: "circle", bg: "#F1F5F9", color: "#64748B", lib: "feather" },
};

export function CategoryIcon({ category, size = 40, iconSize = 18 }: CategoryIconProps) {
  const config = CATEGORY_CONFIG[category];
  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: config.bg },
      ]}
    >
      <Feather name={config.icon as any} size={iconSize} color={config.color} />
    </View>
  );
}

export function getCategoryLabel(category: TransactionCategory): string {
  const labels: Record<TransactionCategory, string> = {
    food: "Food & Drink",
    transport: "Transport",
    entertainment: "Entertainment",
    shopping: "Shopping",
    housing: "Housing",
    health: "Health",
    education: "Education",
    income: "Income",
    other: "Other",
  };
  return labels[category];
}

export function getCategoryColor(category: TransactionCategory): string {
  return CATEGORY_CONFIG[category].color;
}

export function getCategoryBg(category: TransactionCategory): string {
  return CATEGORY_CONFIG[category].bg;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});

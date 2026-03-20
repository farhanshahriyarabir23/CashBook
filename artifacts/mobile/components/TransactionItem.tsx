import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Transaction } from "@/context/FinanceContext";
import { CategoryIcon, getCategoryLabel } from "./CategoryIcon";

type TransactionItemProps = {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  showDate?: boolean;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TransactionItem({ transaction, onDelete, showDate = false }: TransactionItemProps) {
  const C = Colors.light;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handleLongPress = () => {
    if (onDelete) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onDelete(transaction.id);
    }
  };

  const isIncome = transaction.type === "income";

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        style={styles.container}
      >
        <CategoryIcon category={transaction.category} />

        <View style={styles.info}>
          <Text style={[styles.title, { color: C.text }]} numberOfLines={1}>
            {transaction.title}
          </Text>
          <Text style={[styles.meta, { color: C.textSecondary }]}>
            {getCategoryLabel(transaction.category)}
            {showDate ? ` • ${formatDate(transaction.date)}` : ""}
          </Text>
        </View>

        <View style={styles.right}>
          <Text
            style={[
              styles.amount,
              { color: isIncome ? C.income : C.expense },
            ]}
          >
            {isIncome ? "+" : "-"}${transaction.amount.toFixed(2)}
          </Text>
          {showDate && (
            <Text style={[styles.date, { color: C.textTertiary }]}>
              {formatDate(transaction.date)}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  meta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});

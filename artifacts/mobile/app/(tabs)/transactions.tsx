import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { TransactionItem } from "@/components/TransactionItem";
import { Card } from "@/components/ui/Card";
import { Transaction, useFinance } from "@/context/FinanceContext";

const C = Colors.light;

type Section = {
  title: string;
  data: Transaction[];
};

function formatSectionTitle(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

const FILTER_TABS = ["All", "Income", "Expense"] as const;
type FilterTab = typeof FILTER_TABS[number];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("All");
  const { transactions, deleteTransaction, monthlyIncome, monthlyExpense } = useFinance();

  const filtered = useMemo(() => {
    if (filter === "Income") return transactions.filter((t) => t.type === "income");
    if (filter === "Expense") return transactions.filter((t) => t.type === "expense");
    return transactions;
  }, [transactions, filter]);

  const sections: Section[] = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const key = new Date(t.date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).map(([key, data]) => ({
      title: formatSectionTitle(data[0].date),
      data,
    }));
  }, [filtered]);

  const handleDelete = (id: string) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          deleteTransaction(id);
        },
      },
    ]);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Transactions</Text>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowAddSheet(true);
            }}
            style={[styles.addBtn, { backgroundColor: C.tintLight }]}
          >
            <Feather name="plus" size={20} color={C.tint} />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, { backgroundColor: C.incomeLight }]}>
            <Feather name="arrow-down" size={14} color={C.income} />
            <Text style={[styles.summaryAmount, { color: C.income }]}>+${monthlyIncome.toFixed(0)}</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: C.expenseLight }]}>
            <Feather name="arrow-up" size={14} color={C.expense} />
            <Text style={[styles.summaryAmount, { color: C.expense }]}>-${monthlyExpense.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setFilter(tab)}
              style={[
                styles.filterTab,
                filter === tab && { backgroundColor: C.tint },
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: filter === tab ? "#fff" : C.textSecondary },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {sections.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: C.backgroundSecondary }]}>
              <Feather name="inbox" size={28} color={C.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.text }]}>No transactions</Text>
            <Text style={[styles.emptySubtext, { color: C.textSecondary }]}>
              Tap + to add your first transaction
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
            showsVerticalScrollIndicator={false}
            renderSectionHeader={({ section }) => (
              <Text style={[styles.sectionHeader, { color: C.textSecondary }]}>
                {section.title}
              </Text>
            )}
            renderItem={({ item, index, section }) => (
              <Card style={index === 0 ? styles.firstCard : styles.middleCard} padding={0} elevated={false}>
                <View style={{ paddingHorizontal: 16 }}>
                  <TransactionItem transaction={item} onDelete={handleDelete} />
                </View>
              </Card>
            )}
          />
        )}
      </View>

      <AddTransactionSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
  },
  summaryAmount: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 16,
  },
  firstCard: { marginBottom: 2, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  middleCard: { marginBottom: 2, borderRadius: 0 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});

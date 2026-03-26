import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Toast } from "@/components/Toast";
import { formatAmount } from "@/utils/currency";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionItem } from "@/components/TransactionItem";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";

const C = Colors.light;

function getDisplayName(user: { user_metadata?: { displayName?: string } | null; email?: string | null } | null) {
  const displayName = user?.user_metadata?.displayName?.trim();
  if (displayName) return displayName;

  const emailName = user?.email?.split("@")[0]?.trim();
  return emailName || "Student";
}

function getAvatarInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "S";
}

function BalanceCard({
  balance,
  income,
  expense,
  displayName,
}: {
  balance: number;
  income: number;
  expense: number;
  displayName: string;
}) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const avatarInitial = getAvatarInitial(displayName);
  const { signOut } = useAuth();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  return (
    <View style={[styles.balanceCard, { paddingTop: topPad + 16 }]}>
      <View style={styles.topRow}>
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeLabel}>Welcome,</Text>
          <Text style={styles.welcomeName} numberOfLines={1}>
            {displayName} <Text style={styles.welcomeWave}>👋</Text>
          </Text>
        </View>
        <View style={styles.avatarMenuWrap}>
          <Pressable onPress={() => setShowAvatarMenu((current) => !current)}>
            <View style={styles.balanceAvatar}>
              <Text style={styles.balanceAvatarText}>{avatarInitial}</Text>
            </View>
          </Pressable>
          {showAvatarMenu ? (
            <View style={styles.avatarMenu}>
              <Pressable
                style={styles.avatarMenuItem}
                onPress={() => {
                  setShowAvatarMenu(false);
                  signOut();
                }}
              >
                <Feather name="log-out" size={16} color={C.expense} />
                <Text style={styles.avatarMenuText}>Logout</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.balanceCenter}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatAmount(balance, 2)}</Text>
      </View>

      <View style={styles.balanceStats}>
        <View style={styles.balanceStat}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="arrow-down-circle" size={16} color="#fff" />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatAmount(income)}</Text>
          </View>
        </View>
        <View style={[styles.balanceDivider]} />
        <View style={styles.balanceStat}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="arrow-up-circle" size={16} color="#fff" />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{formatAmount(expense)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;
  const [showAddSheet, setShowAddSheet] = useState(false);
  const { user } = useAuth();
  const { transactions, budgets, totalBalance, monthlyIncome, monthlyExpense, deleteTransaction } = useFinance();
  const displayName = getDisplayName(user);

  const recentTransactions = transactions.slice(0, 5);
  const topBudgets = budgets.slice(0, 3);

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (_err) {
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: "Could not delete the transaction. Please try again.",
      });
    }
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: C.background }]}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <BalanceCard
          balance={totalBalance}
          income={monthlyIncome}
          expense={monthlyExpense}
          displayName={displayName}
        />

        <View style={styles.body}>
          {/* <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Budget Overview</Text>
              <Text style={[styles.sectionLink, { color: C.tint }]}>This month</Text>
            </View>
            <Card>
              {topBudgets.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="pie-chart" size={32} color={C.textTertiary} />
                  <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                    No budgets yet
                  </Text>
                </View>
              ) : (
                topBudgets.map((budget, idx) => {
                  const progress = budget.spent / budget.limit;
                  const isOver = progress > 1;
                  return (
                    <View key={budget.id}>
                      {idx > 0 && <View style={[styles.itemDivider, { backgroundColor: C.borderLight }]} />}
                      <View style={styles.budgetRow}>
                        <View style={styles.budgetLeft}>
                          <View style={[styles.budgetDot, { backgroundColor: budget.color }]} />
                          <Text style={[styles.budgetName, { color: C.text }]}>
                            {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.budgetAmount,
                            { color: isOver ? C.expense : C.textSecondary },
                          ]}
                        >
                          {formatAmount(budget.spent)} / {formatAmount(budget.limit)}
                        </Text>
                      </View>
                      <ProgressBar
                        progress={progress}
                        color={isOver ? C.expense : budget.color}
                        height={5}
                        style={{ marginTop: 6, marginBottom: 4 }}
                      />
                    </View>
                  );
                })
              )}
            </Card>
          </View> */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Recent Transactions</Text>
            </View>
            <Card>
              {recentTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="inbox" size={32} color={C.textTertiary} />
                  <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                    No transactions yet
                  </Text>
                </View>
              ) : (
                recentTransactions.map((t, idx) => (
                  <View key={t.id}>
                    {idx > 0 && <View style={[styles.itemDivider, { backgroundColor: C.borderLight }]} />}
                    <TransactionItem
                      transaction={t}
                      onDelete={handleDeleteTransaction}
                    />
                  </View>
                ))
              )}
            </Card>
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          setShowAddSheet(true);
        }}
        style={[styles.fab, { backgroundColor: C.tint, bottom: bottomPad - 20 }]}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      <AddTransactionSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  balanceCard: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 16,
  },
  balanceCenter: {
    alignItems: "center",
    marginBottom: 28,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
    textAlign: "center",
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    textAlign: "center",
  },
  welcomeBlock: {
    alignItems: "flex-start",
    flexShrink: 1,
    maxWidth: "72%",
  },
  welcomeLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  welcomeName: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    textAlign: "left",
  },
  welcomeWave: {
    fontSize: 16,
  },
  avatarMenuWrap: {
    alignItems: "flex-end",
    position: "relative",
    zIndex: 20,
  },
  balanceAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  avatarMenu: {
    position: "absolute",
    top: 52,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    minWidth: 124,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatarMenuText: {
    color: C.expense,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  balanceStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    gap: 0,
  },
  balanceStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
    height: "100%",
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statValue: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  body: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  sectionLink: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  budgetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  budgetDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  budgetName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  budgetAmount: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  itemDivider: {
    height: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

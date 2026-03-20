import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Budget, useFinance } from "@/context/FinanceContext";
import { getCategoryLabel } from "@/components/CategoryIcon";
import { CategoryIcon } from "@/components/CategoryIcon";

const C = Colors.light;

function BudgetCard({ budget }: { budget: Budget }) {
  const progress = budget.spent / budget.limit;
  const remaining = budget.limit - budget.spent;
  const isOver = progress > 1;

  return (
    <Card style={styles.budgetCard}>
      <View style={styles.budgetTop}>
        <View style={styles.budgetLeft}>
          <CategoryIcon category={budget.category} size={44} iconSize={20} />
          <View>
            <Text style={[styles.budgetTitle, { color: C.text }]}>
              {getCategoryLabel(budget.category)}
            </Text>
            <Text style={[styles.budgetSub, { color: C.textSecondary }]}>
              ${budget.spent.toFixed(2)} spent
            </Text>
          </View>
        </View>
        <View style={styles.budgetRight}>
          <Text style={[styles.budgetLimit, { color: C.textTertiary }]}>
            /${budget.limit}
          </Text>
          {isOver ? (
            <Text style={[styles.overLabel, { color: C.expense }]}>Over budget</Text>
          ) : (
            <Text style={[styles.remainingLabel, { color: C.textSecondary }]}>
              ${remaining.toFixed(0)} left
            </Text>
          )}
        </View>
      </View>

      <ProgressBar
        progress={progress}
        color={isOver ? C.expense : budget.color}
        height={8}
        style={{ marginTop: 14 }}
      />

      <View style={styles.budgetFooter}>
        <Text style={[styles.budgetPct, { color: isOver ? C.expense : C.textTertiary }]}>
          {Math.round(progress * 100)}% used
        </Text>
        {!isOver && (
          <Text style={[styles.budgetStatus, { color: C.tint }]}>On track</Text>
        )}
      </View>
    </Card>
  );
}

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;
  const { budgets, monthlyExpense, monthlyIncome } = useFinance();

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = totalBudgeted > 0 ? totalSpent / totalBudgeted : 0;
  const savings = monthlyIncome - monthlyExpense;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.headerTitle, { color: C.text }]}>Budget</Text>
        <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </Text>
      </View>

      <View style={styles.body}>
        <Card style={styles.summaryCard} elevated>
          <View style={styles.summaryTop}>
            <View>
              <Text style={[styles.summaryLabel, { color: C.textSecondary }]}>Total Budgeted</Text>
              <Text style={[styles.summaryAmount, { color: C.text }]}>${totalBudgeted.toFixed(0)}</Text>
            </View>
            <View style={[styles.savingsChip, { backgroundColor: savings >= 0 ? C.incomeLight : C.expenseLight }]}>
              <Feather
                name={savings >= 0 ? "trending-up" : "trending-down"}
                size={14}
                color={savings >= 0 ? C.income : C.expense}
              />
              <Text style={[styles.savingsText, { color: savings >= 0 ? C.income : C.expense }]}>
                {savings >= 0 ? "+" : ""}${savings.toFixed(0)} saved
              </Text>
            </View>
          </View>

          <View style={styles.summaryMid}>
            <Text style={[styles.summarySpent, { color: C.textSecondary }]}>
              Spent: <Text style={{ color: C.text, fontFamily: "Inter_600SemiBold" }}>${totalSpent.toFixed(2)}</Text>
            </Text>
            <Text style={[styles.summarySpent, { color: C.textSecondary }]}>
              Remaining: <Text style={{ color: overallProgress > 1 ? C.expense : C.tint, fontFamily: "Inter_600SemiBold" }}>
                ${(totalBudgeted - totalSpent).toFixed(2)}
              </Text>
            </Text>
          </View>

          <ProgressBar
            progress={overallProgress}
            color={overallProgress > 0.85 ? C.expense : C.tint}
            height={10}
            style={{ marginTop: 12 }}
          />
          <Text style={[styles.overallPct, { color: C.textTertiary }]}>
            {Math.round(overallProgress * 100)}% of total budget used
          </Text>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Category Breakdown</Text>
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  body: {
    padding: 20,
    gap: 24,
  },
  summaryCard: {},
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  savingsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  savingsText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  summaryMid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summarySpent: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  overallPct: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  budgetCard: {},
  budgetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  budgetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  budgetTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  budgetSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  budgetRight: {
    alignItems: "flex-end",
  },
  budgetLimit: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  overLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  remainingLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  budgetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  budgetPct: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  budgetStatus: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});

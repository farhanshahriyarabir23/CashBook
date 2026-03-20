import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SavingGoal, useFinance } from "@/context/FinanceContext";

const C = Colors.light;

function daysUntil(iso: string): number {
  const target = new Date(iso);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
}

function GoalCard({
  goal,
  onDelete,
  onContribute,
}: {
  goal: SavingGoal;
  onDelete: (id: string) => void;
  onContribute: (id: string) => void;
}) {
  const progress = goal.savedAmount / goal.targetAmount;
  const days = daysUntil(goal.deadline);
  const remaining = goal.targetAmount - goal.savedAmount;

  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleRow}>
          <View style={[styles.goalEmoji, { backgroundColor: goal.color + "20" }]}>
            <Text style={styles.goalEmojiText}>{goal.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.goalTitle, { color: C.text }]} numberOfLines={1}>
              {goal.title}
            </Text>
            <Text style={[styles.goalDeadline, { color: C.textSecondary }]}>
              {days} days left
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => onDelete(goal.id)}
          style={styles.deleteBtn}
          hitSlop={8}
        >
          <Feather name="trash-2" size={16} color={C.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.goalAmounts}>
        <Text style={[styles.goalSaved, { color: C.text }]}>
          ${goal.savedAmount.toFixed(0)}
          <Text style={[styles.goalTarget, { color: C.textSecondary }]}>
            {" "}/ ${goal.targetAmount.toFixed(0)}
          </Text>
        </Text>
        <Text style={[styles.goalPct, { color: goal.color }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      <ProgressBar
        progress={progress}
        color={goal.color}
        height={8}
        style={{ marginTop: 10, marginBottom: 10 }}
      />

      <View style={styles.goalFooter}>
        <Text style={[styles.goalRemaining, { color: C.textSecondary }]}>
          ${remaining.toFixed(0)} to go
        </Text>
        <Pressable
          onPress={() => onContribute(goal.id)}
          style={[styles.contributeBtn, { backgroundColor: goal.color + "20" }]}
        >
          <Text style={[styles.contributeBtnText, { color: goal.color }]}>+ Add Funds</Text>
        </Pressable>
      </View>
    </Card>
  );
}

function AddGoalSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { addSavingGoal } = useFinance();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [initial, setInitial] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [color, setColor] = useState("#2563EB");

  const COLORS = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0EA5E9", "#EC4899"];
  const EMOJIS = ["🎯", "💻", "✈️", "🛡️", "📚", "🏠", "🎮", "🚗", "👟", "💎"];

  const handleCreate = () => {
    if (!title || !target) return;
    const targetNum = parseFloat(target);
    const initialNum = parseFloat(initial) || 0;
    if (isNaN(targetNum) || targetNum <= 0) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    addSavingGoal({
      title,
      targetAmount: targetNum,
      savedAmount: initialNum,
      deadline: new Date(Date.now() + 90 * 86400000).toISOString(),
      emoji,
      color,
    });
    setTitle(""); setTarget(""); setInitial(""); setEmoji("🎯"); setColor("#2563EB");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheetContainer, { backgroundColor: C.backgroundCard }]}>
        <View style={[styles.sheetHeader, { borderBottomColor: C.border }]}>
          <Text style={[styles.sheetTitle, { color: C.text }]}>New Saving Goal</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={C.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sheetLabel, { color: C.textSecondary }]}>Pick an emoji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.emojiRow}>
              {EMOJIS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setEmoji(e)}
                  style={[
                    styles.emojiBtn,
                    { backgroundColor: emoji === e ? C.tintLight : C.backgroundSecondary },
                  ]}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.sheetLabel, { color: C.textSecondary }]}>Goal Name</Text>
          <TextInput
            style={[styles.sheetInput, { borderColor: C.border, color: C.text, backgroundColor: C.backgroundSecondary }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. New Laptop"
            placeholderTextColor={C.textTertiary}
          />

          <Text style={[styles.sheetLabel, { color: C.textSecondary, marginTop: 16 }]}>Target Amount ($)</Text>
          <TextInput
            style={[styles.sheetInput, { borderColor: C.border, color: C.text, backgroundColor: C.backgroundSecondary }]}
            value={target}
            onChangeText={setTarget}
            placeholder="1000"
            placeholderTextColor={C.textTertiary}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.sheetLabel, { color: C.textSecondary, marginTop: 16 }]}>Starting Amount ($)</Text>
          <TextInput
            style={[styles.sheetInput, { borderColor: C.border, color: C.text, backgroundColor: C.backgroundSecondary }]}
            value={initial}
            onChangeText={setInitial}
            placeholder="0"
            placeholderTextColor={C.textTertiary}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.sheetLabel, { color: C.textSecondary, marginTop: 16 }]}>Color</Text>
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  color === c && styles.colorSwatchSelected,
                ]}
              >
                {color === c && <Feather name="check" size={14} color="#fff" />}
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleCreate}
            style={[styles.createBtn, { backgroundColor: color }]}
          >
            <Text style={styles.createBtnText}>Create Goal</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ContributeSheet({ goalId, onClose }: { goalId: string | null; onClose: () => void }) {
  const { savingGoals, updateSavingGoal } = useFinance();
  const goal = savingGoals.find((g) => g.id === goalId);
  const [amount, setAmount] = useState("");

  const handleContribute = () => {
    if (!goal || !amount) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    updateSavingGoal(goal.id, goal.savedAmount + parsed);
    setAmount("");
    onClose();
  };

  return (
    <Modal visible={!!goalId} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      {goal && (
        <View style={[styles.sheetContainer, { backgroundColor: C.backgroundCard }]}>
          <View style={[styles.sheetHeader, { borderBottomColor: C.border }]}>
            <Text style={[styles.sheetTitle, { color: C.text }]}>Add Funds</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={22} color={C.textSecondary} />
            </Pressable>
          </View>
          <View style={{ padding: 20 }}>
            <Text style={[styles.contributeName, { color: C.text }]}>
              {goal.emoji} {goal.title}
            </Text>
            <Text style={[styles.contributeProgress, { color: C.textSecondary }]}>
              ${goal.savedAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
            </Text>
            <ProgressBar progress={goal.savedAmount / goal.targetAmount} color={goal.color} height={8} style={{ marginVertical: 16 }} />

            <Text style={[styles.sheetLabel, { color: C.textSecondary }]}>Amount to add ($)</Text>
            <TextInput
              style={[styles.sheetInput, { borderColor: C.border, color: C.text, backgroundColor: C.backgroundSecondary }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={C.textTertiary}
              keyboardType="decimal-pad"
              autoFocus
            />

            <Pressable
              onPress={handleContribute}
              style={[styles.createBtn, { backgroundColor: goal.color, marginTop: 20 }]}
            >
              <Text style={styles.createBtnText}>Add Funds</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Modal>
  );
}

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const { savingGoals, deleteSavingGoal } = useFinance();

  const totalSaved = savingGoals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = savingGoals.reduce((s, g) => s + g.targetAmount, 0);

  const handleDelete = (id: string) => {
    Alert.alert("Delete Goal", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          deleteSavingGoal(id);
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: C.background }]}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <View>
            <Text style={[styles.headerTitle, { color: C.text }]}>Saving Goals</Text>
            <Text style={[styles.headerSubtitle, { color: C.textSecondary }]}>
              {savingGoals.length} active goal{savingGoals.length !== 1 ? "s" : ""}
            </Text>
          </View>
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

        <View style={styles.body}>
          {totalTarget > 0 && (
            <Card elevated style={styles.totalCard}>
              <Text style={[styles.totalLabel, { color: C.textSecondary }]}>Total Saved</Text>
              <View style={styles.totalRow}>
                <Text style={[styles.totalAmount, { color: C.text }]}>${totalSaved.toFixed(0)}</Text>
                <Text style={[styles.totalTarget, { color: C.textSecondary }]}>/ ${totalTarget.toFixed(0)}</Text>
              </View>
              <ProgressBar
                progress={totalTarget > 0 ? totalSaved / totalTarget : 0}
                color={C.tint}
                height={10}
                style={{ marginTop: 12 }}
              />
              <Text style={[styles.totalPct, { color: C.textSecondary }]}>
                {Math.round((totalSaved / totalTarget) * 100)}% of all goals reached
              </Text>
            </Card>
          )}

          {savingGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: C.backgroundSecondary }]}>
                <Feather name="target" size={28} color={C.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: C.text }]}>No saving goals yet</Text>
              <Text style={[styles.emptySubtext, { color: C.textSecondary }]}>
                Set a goal to start saving
              </Text>
              <Pressable
                onPress={() => setShowAddSheet(true)}
                style={[styles.emptyBtn, { backgroundColor: C.tint }]}
              >
                <Text style={styles.emptyBtnText}>Create First Goal</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.goalsGrid}>
              {savingGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDelete}
                  onContribute={setContributeGoalId}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <AddGoalSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
      <ContributeSheet goalId={contributeGoalId} onClose={() => setContributeGoalId(null)} />
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 20,
    gap: 20,
  },
  totalCard: {},
  totalLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  totalTarget: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
  },
  totalPct: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  goalsGrid: {
    gap: 14,
  },
  goalCard: {},
  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  goalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  goalEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  goalEmojiText: {
    fontSize: 22,
  },
  goalTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  goalDeadline: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  goalAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 14,
  },
  goalSaved: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  goalTarget: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  goalPct: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  goalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalRemaining: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  contributeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  contributeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
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
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    marginTop: 8,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sheetContainer: { flex: 1 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContent: {
    padding: 20,
  },
  sheetLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sheetInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  emojiRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  createBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  contributeName: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  contributeProgress: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});

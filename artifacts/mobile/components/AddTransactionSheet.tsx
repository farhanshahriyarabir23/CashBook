import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Toast } from "@/components/Toast";
import {
  TransactionCategory,
  useFinance,
} from "@/context/FinanceContext";
import { CURRENCY_SYMBOL } from "@/utils/currency";
import { getCategoryBg, getCategoryColor, getCategoryLabel } from "./CategoryIcon";

const CATEGORIES: TransactionCategory[] = [
  "food",
  "transport",
  "entertainment",
  "shopping",
  "housing",
  "health",
  "education",
  "other",
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AddTransactionSheet({ visible, onClose }: Props) {
  const C = Colors.light;
  const insets = useSafeAreaInsets();
  const { addTransaction } = useFinance();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("food");
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!amount || !title) {
      Alert.alert("Missing info", "Please enter both a title and an amount.");
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid positive amount.");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await addTransaction({
        title,
        amount: parsed,
        type,
        category: type === "income" ? "income" : category,
        date: new Date().toISOString(),
        note: note || undefined,
      });
      setAmount("");
      setTitle("");
      setNote("");
      setCategory("food");
      onClose();
    } catch (_err) {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Could not save the transaction. Check Supabase setup and try again.",
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: C.backgroundCard }]}>
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Add Transaction</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={C.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.typeToggle, { backgroundColor: C.backgroundSecondary }]}>
            {(["expense", "income"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  setType(t);
                  if (t === "income") setCategory("income");
                  else setCategory("food");
                }}
                style={[
                  styles.typeBtn,
                  type === t && {
                    backgroundColor: t === "income" ? C.incomeLight : C.expenseLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    { color: type === t ? (t === "income" ? C.income : C.expense) : C.textSecondary },
                  ]}
                >
                  {t === "income" ? "Income" : "Expense"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountCurrency, { color: C.textSecondary }]}>{CURRENCY_SYMBOL}</Text>
            <TextInput
              style={[styles.amountInput, { color: C.text }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={C.border}
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: C.border }]} />

          <Text style={[styles.label, { color: C.textSecondary }]}>Title</Text>
          <TextInput
            style={[styles.input, { borderColor: C.border, color: C.text, backgroundColor: C.backgroundSecondary }]}
            value={title}
            onChangeText={setTitle}
            placeholder="What was this for?"
            placeholderTextColor={C.textTertiary}
            returnKeyType="next"
          />

          {type === "expense" && (
            <>
              <Text style={[styles.label, { color: C.textSecondary, marginTop: 16 }]}>Category</Text>
              <View style={styles.categories}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: category === cat ? getCategoryBg(cat) : C.backgroundSecondary,
                        borderColor: category === cat ? getCategoryColor(cat) : "transparent",
                        borderWidth: 1.5,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: category === cat ? getCategoryColor(cat) : C.textSecondary },
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Text style={[styles.label, { color: C.textSecondary, marginTop: 16 }]}>Note (optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.noteInput,
              { borderColor: C.border, color: C.text, backgroundColor: C.backgroundSecondary },
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={C.textTertiary}
            multiline
            numberOfLines={3}
          />

          <Pressable
            onPress={handleSubmit}
            style={[styles.submitBtn, { backgroundColor: type === "income" ? C.income : C.tint }]}
          >
            <Text style={styles.submitBtnText}>Add {type === "income" ? "Income" : "Expense"}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
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
  content: {
    padding: 20,
    gap: 0,
  },
  typeToggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  typeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 24,
  },
  amountCurrency: {
    fontSize: 36,
    fontFamily: "Inter_400Regular",
  },
  amountInput: {
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    minWidth: 120,
    textAlign: "center",
  },
  divider: { height: 1, marginBottom: 20 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  noteInput: {
    height: 80,
    textAlignVertical: "top",
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});

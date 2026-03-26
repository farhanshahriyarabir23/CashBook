import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
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
import { Toast } from "@/components/Toast";
import { formatAmount } from "@/utils/currency";
import { AddTransactionSheet } from "@/components/AddTransactionSheet";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionItem } from "@/components/TransactionItem";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";

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
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [accountView, setAccountView] = useState<'menu' | 'password' | 'email' | 'delete'>('menu');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);

  return (
    <View style={[styles.balanceCard, { paddingTop: topPad + 16 }]}>
      <View style={styles.topRow}>
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeLabel}>Welcome,</Text>
          <Text style={styles.welcomeName} numberOfLines={1}>
            {displayName} <Text style={styles.welcomeWave}>👋</Text>
          </Text>
        </View>
        <Pressable onPress={() => { setAccountView('menu'); setShowAccountSheet(true); }}>
          <View style={styles.balanceAvatar}>
            <Text style={styles.balanceAvatarText}>{avatarInitial}</Text>
          </View>
        </Pressable>
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

      {/* Account Management Sheet */}
      <Modal
        visible={showAccountSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowAccountSheet(false); setAccountView('menu'); }}
      >
        <View style={[acctStyles.container, { backgroundColor: C.backgroundCard }]}>
          <View style={[acctStyles.header, { borderBottomColor: C.border }]}>
            {accountView !== 'menu' ? (
              <Pressable onPress={() => setAccountView('menu')}>
                <Feather name="arrow-left" size={22} color={C.text} />
              </Pressable>
            ) : (
              <View style={{ width: 22 }} />
            )}
            <Text style={[acctStyles.headerTitle, { color: C.text }]}>
              {accountView === 'menu' ? 'Account' : accountView === 'password' ? 'Change Password' : accountView === 'email' ? 'Change Email' : 'Delete Account'}
            </Text>
            <Pressable onPress={() => { setShowAccountSheet(false); setAccountView('menu'); }}>
              <Feather name="x" size={22} color={C.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={acctStyles.content} keyboardShouldPersistTaps="handled">
            {accountView === 'menu' && (
              <>
                <View style={acctStyles.avatarSection}>
                  <View style={[acctStyles.avatarLg, { backgroundColor: C.tint }]}>
                    <Text style={acctStyles.avatarLgText}>{avatarInitial}</Text>
                  </View>
                  <Text style={[acctStyles.avatarName, { color: C.text }]}>{displayName}</Text>
                </View>

                <Pressable
                  onPress={() => { setNewPassword(''); setAccountView('password'); }}
                  style={({ pressed }) => [acctStyles.menuRow, { backgroundColor: pressed ? C.backgroundSecondary : 'transparent' }]}
                >
                  <View style={[acctStyles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
                    <Feather name="lock" size={18} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[acctStyles.menuLabel, { color: C.text }]}>Change Password</Text>
                    <Text style={[acctStyles.menuDesc, { color: C.textSecondary }]}>Update your account password</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={C.textTertiary} />
                </Pressable>

                <Pressable
                  onPress={() => { setNewEmail(''); setAccountView('email'); }}
                  style={({ pressed }) => [acctStyles.menuRow, { backgroundColor: pressed ? C.backgroundSecondary : 'transparent' }]}
                >
                  <View style={[acctStyles.menuIcon, { backgroundColor: '#F0FDF4' }]}>
                    <Feather name="mail" size={18} color="#16A34A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[acctStyles.menuLabel, { color: C.text }]}>Change Email</Text>
                    <Text style={[acctStyles.menuDesc, { color: C.textSecondary }]}>Update your email address</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={C.textTertiary} />
                </Pressable>

                <View style={[acctStyles.divider, { backgroundColor: C.borderLight }]} />

                <Pressable
                  onPress={() => setAccountView('delete')}
                  style={({ pressed }) => [acctStyles.menuRow, { backgroundColor: pressed ? '#FEF2F2' : 'transparent' }]}
                >
                  <View style={[acctStyles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                    <Feather name="user-x" size={18} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[acctStyles.menuLabel, { color: '#DC2626' }]}>Delete Account</Text>
                    <Text style={[acctStyles.menuDesc, { color: C.textSecondary }]}>Permanently remove your account</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={C.textTertiary} />
                </Pressable>

                <View style={[acctStyles.divider, { backgroundColor: C.borderLight }]} />

                <Pressable
                  onPress={() => { setShowAccountSheet(false); signOut(); }}
                  style={({ pressed }) => [acctStyles.menuRow, { backgroundColor: pressed ? C.backgroundSecondary : 'transparent' }]}
                >
                  <View style={[acctStyles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Feather name="log-out" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[acctStyles.menuLabel, { color: C.text }]}>Sign Out</Text>
                    <Text style={[acctStyles.menuDesc, { color: C.textSecondary }]}>Log out of your account</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={C.textTertiary} />
                </Pressable>
              </>
            )}

            {accountView === 'password' && (
              <View style={acctStyles.formSection}>
                <Text style={[acctStyles.formLabel, { color: C.textSecondary }]}>New Password</Text>
                <TextInput
                  style={[acctStyles.formInput, { borderColor: C.border, color: C.text, backgroundColor: C.backgroundSecondary }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={C.textTertiary}
                  secureTextEntry
                />
                <Pressable
                  onPress={async () => {
                    if (!newPassword || newPassword.length < 6) {
                      Toast.show({ type: 'error', text1: 'Too Short', text2: 'Password must be at least 6 characters.' });
                      return;
                    }
                    setAccountLoading(true);
                    try {
                      const { error } = await supabase.auth.updateUser({ password: newPassword });
                      if (error) throw error;
                      Toast.show({ type: 'success', text1: 'Password Updated', text2: 'Your password has been changed successfully.' });
                      setAccountView('menu');
                    } catch (err: any) {
                      Toast.show({ type: 'error', text1: 'Update Failed', text2: err.message || 'Could not update password.' });
                    } finally {
                      setAccountLoading(false);
                    }
                  }}
                  disabled={accountLoading || !newPassword}
                  style={({ pressed }) => [acctStyles.formBtn, { opacity: accountLoading || !newPassword ? 0.6 : 1 }, pressed && { opacity: 0.8 }]}
                >
                  <Text style={acctStyles.formBtnText}>{accountLoading ? 'Saving...' : 'Update Password'}</Text>
                </Pressable>
              </View>
            )}

            {accountView === 'email' && (
              <View style={acctStyles.formSection}>
                <Text style={[acctStyles.formLabel, { color: C.textSecondary }]}>New Email Address</Text>
                <TextInput
                  style={[acctStyles.formInput, { borderColor: C.border, color: C.text, backgroundColor: C.backgroundSecondary }]}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="new@email.com"
                  placeholderTextColor={C.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={async () => {
                    if (!newEmail || !newEmail.includes('@')) {
                      Toast.show({ type: 'error', text1: 'Invalid Email', text2: 'Please enter a valid email address.' });
                      return;
                    }
                    setAccountLoading(true);
                    try {
                      const { error } = await supabase.auth.updateUser({ email: newEmail });
                      if (error) throw error;
                      Toast.show({ type: 'success', text1: 'Verification Sent', text2: 'Check your new email to confirm the change.' });
                      setAccountView('menu');
                    } catch (err: any) {
                      Toast.show({ type: 'error', text1: 'Update Failed', text2: err.message || 'Could not update email.' });
                    } finally {
                      setAccountLoading(false);
                    }
                  }}
                  disabled={accountLoading || !newEmail}
                  style={({ pressed }) => [acctStyles.formBtn, { backgroundColor: '#16A34A', opacity: accountLoading || !newEmail ? 0.6 : 1 }, pressed && { opacity: 0.8 }]}
                >
                  <Text style={acctStyles.formBtnText}>{accountLoading ? 'Saving...' : 'Update Email'}</Text>
                </Pressable>
              </View>
            )}

            {accountView === 'delete' && (
              <View style={acctStyles.formSection}>
                <View style={acctStyles.deleteWarning}>
                  <View style={acctStyles.deleteIconCircle}>
                    <Feather name="alert-triangle" size={28} color="#fff" />
                  </View>
                  <Text style={[acctStyles.deleteTitle, { color: C.text }]}>This is permanent</Text>
                  <Text style={[acctStyles.deleteDesc, { color: C.textSecondary }]}>
                    Deleting your account will remove all your data, transactions, and goals forever. This cannot be undone.
                  </Text>
                </View>
                <Pressable
                  onPress={async () => {
                    setAccountLoading(true);
                    try {
                      Toast.show({ type: 'info', text1: 'Account Deletion', text2: 'Please contact support to complete account deletion.' });
                      setShowAccountSheet(false);
                      setAccountView('menu');
                    } catch (err: any) {
                      Toast.show({ type: 'error', text1: 'Error', text2: err.message || 'Something went wrong.' });
                    } finally {
                      setAccountLoading(false);
                    }
                  }}
                  disabled={accountLoading}
                  style={({ pressed }) => [acctStyles.deleteBtn, { opacity: accountLoading ? 0.6 : 1 }, pressed && { opacity: 0.85 }]}
                >
                  <Feather name="trash-2" size={16} color="#fff" />
                  <Text style={acctStyles.deleteBtnText}>{accountLoading ? 'Processing...' : 'Delete My Account'}</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;
  const [showAddSheet, setShowAddSheet] = useState(false);
  const { user } = useAuth();
  const { transactions, savingGoals, totalBalance, monthlyIncome, monthlyExpense, deleteTransaction } = useFinance();
  const displayName = getDisplayName(user);

  const recentTransactions = transactions.slice(0, 5);
  const topGoals = savingGoals.slice(0, 3);

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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Active Goals</Text>
            </View>
            <Card>
              {topGoals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="target" size={32} color={C.textTertiary} />
                  <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                    No active goals
                  </Text>
                </View>
              ) : (
                topGoals.map((goal, idx) => {
                  const progress = Math.min(goal.savedAmount / goal.targetAmount, 1);
                  const isCompleted = progress >= 1;
                  return (
                    <View key={goal.id}>
                      {idx > 0 && <View style={[styles.itemDivider, { backgroundColor: C.borderLight }]} />}
                      <View style={styles.goalRow}>
                        <View style={styles.goalLeft}>
                          <View style={[styles.goalEmojiWrap, { backgroundColor: goal.color + "20" }]}>
                            <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                          </View>
                          <Text style={[styles.goalTitle, { color: C.text }]}>
                            {goal.title}
                          </Text>
                        </View>
                        <View style={styles.goalAmounts}>
                          <Text
                            style={[
                              styles.goalAmount,
                              { color: isCompleted ? C.income : C.text },
                            ]}
                          >
                            {formatAmount(goal.savedAmount)}
                          </Text>
                          <Text style={[styles.goalTarget, { color: C.textTertiary }]}>
                            of {formatAmount(goal.targetAmount)}
                          </Text>
                        </View>
                      </View>
                      <ProgressBar
                        progress={progress}
                        color={isCompleted ? C.income : goal.color}
                        height={6}
                        style={{ marginTop: 8, marginBottom: 4 }}
                      />
                    </View>
                  );
                })
              )}
            </Card>
          </View>

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
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 4,
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalEmojiWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  goalEmoji: {
    fontSize: 18,
  },
  goalTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  goalAmounts: {
    alignItems: "flex-end",
  },
  goalAmount: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  goalTarget: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
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

const acctStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { paddingVertical: 24 },
  avatarSection: { alignItems: "center", paddingBottom: 32 },
  avatarLg: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
  },
  avatarLgText: { color: "#fff", fontSize: 30, fontFamily: "Inter_700Bold" },
  avatarName: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 14 },
  menuRow: {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingHorizontal: 20, paddingVertical: 16,
    borderRadius: 12, marginHorizontal: 12,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  menuLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  menuDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginHorizontal: 32, marginVertical: 12 },
  formSection: { paddingHorizontal: 24, gap: 16 },
  formLabel: {
    fontSize: 13, fontFamily: "Inter_500Medium",
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  formInput: {
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: "Inter_400Regular",
  },
  formBtn: {
    backgroundColor: "#3B82F6", borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
    justifyContent: "center", marginTop: 8,
  },
  formBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  deleteWarning: { alignItems: "center", paddingVertical: 20, gap: 12 },
  deleteIconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#DC2626",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#DC2626", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  deleteTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  deleteDesc: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 21, paddingHorizontal: 20,
  },
  deleteBtn: {
    backgroundColor: "#DC2626", borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
    justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 12,
    shadowColor: "#DC2626", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  deleteBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});

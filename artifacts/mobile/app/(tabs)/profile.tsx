import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "@/components/Toast";
import Colors from "@/constants/colors";
import { CURRENCY_SYMBOL } from "@/utils/currency";
import { useFinance } from "@/context/FinanceContext";
import { useAuth } from "@/context/AuthContext";
import { useAppLock } from "@/context/AppLockContext";
import { formatAmount } from "@/utils/currency";
import { supabase } from "@/utils/supabase";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const C = Colors.light;

function splitDisplayName(displayName: string) {
  const [firstName, ...rest] = displayName.trim().split(/\s+/);

  return {
    firstName: firstName || "",
    lastName: rest.join(" ") || null,
  };
}

function getDisplayName(user: { user_metadata?: { displayName?: string } | null; email?: string | null } | null) {
  const displayName = user?.user_metadata?.displayName?.trim();
  if (displayName) return displayName;

  const emailName = user?.email?.split("@")[0]?.trim();
  return emailName || "Student";
}

function getAvatarInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "S";
}

type SettingRowProps = {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  destructive?: boolean;
};

function SettingRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  onPress,
  rightElement,
  showChevron = true,
  destructive = false,
}: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !rightElement}
      style={({ pressed }) => [
        styles.settingRow,
        pressed && onPress ? { backgroundColor: C.backgroundSecondary } : {},
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={16} color={iconColor} />
      </View>
      <Text
        style={[
          styles.settingLabel,
          { color: destructive ? C.expense : C.text },
        ]}
      >
        {label}
      </Text>
      <View style={styles.settingRight}>
        {value ? (
          <Text style={[styles.settingValue, { color: C.textSecondary }]}>
            {value}
          </Text>
        ) : null}
        {rightElement}
        {showChevron && onPress && !rightElement ? (
          <Feather name="chevron-right" size={16} color={C.textTertiary} />
        ) : null}
      </View>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={[styles.sectionHeader, { color: C.textSecondary }]}>
      {title}
    </Text>
  );
}

function EditProfileModal({
  visible,
  name,
  occupation,
  university,
  major,
  position,
  onSave,
  onClose,
}: {
  visible: boolean;
  name: string;
  occupation: string;
  university: string;
  major: string;
  position: string;
  onSave: (n: string, u: string, m: string, p: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [n, setN] = useState(name);
  const [u, setU] = useState(university);
  const [m, setM] = useState(major);
  const [p, setP] = useState(position);

  const isStudent = occupation === "Student";

  // Sync modal state when it opens or props change
  useEffect(() => {
    if (visible) {
      setN(name);
      setU(university);
      setM(major);
      setP(position);
    }
  }, [visible, name, university, major, position]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: C.backgroundCard }]}>
        <View style={[styles.modalHeader, { borderBottomColor: C.border }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.modalCancel, { color: C.textSecondary }]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={[styles.modalTitle, { color: C.text }]}>
            Edit Profile
          </Text>
          <Pressable
            onPress={() => {
              onSave(n, u, m, p);
              onClose();
            }}
          >
            <Text style={[styles.modalSave, { color: C.tint }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.modalContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalAvatarWrap}>
            <View style={[styles.avatarLarge, { backgroundColor: C.tint }]}>
              <Text style={styles.avatarLargeText}>{n.charAt(0).toUpperCase() || "S"}</Text>
            </View>
          </View>

          <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              {
                borderColor: C.border,
                color: C.text,
                backgroundColor: C.backgroundSecondary,
              },
            ]}
            value={n}
            onChangeText={setN}
            placeholder="Your name"
            placeholderTextColor={C.textTertiary}
          />

          {isStudent ? (
            <>
              <Text style={[styles.fieldLabel, { color: C.textSecondary, marginTop: 16 }]}>
                University
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    borderColor: C.border,
                    color: C.text,
                    backgroundColor: C.backgroundSecondary,
                  },
                ]}
                value={u}
                onChangeText={setU}
                placeholder="Your university"
                placeholderTextColor={C.textTertiary}
              />

              <Text style={[styles.fieldLabel, { color: C.textSecondary, marginTop: 16 }]}>
                Major / Department
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    borderColor: C.border,
                    color: C.text,
                    backgroundColor: C.backgroundSecondary,
                  },
                ]}
                value={m}
                onChangeText={setM}
                placeholder="e.g. Computer Science"
                placeholderTextColor={C.textTertiary}
              />
            </>
          ) : (
            <>
              <Text style={[styles.fieldLabel, { color: C.textSecondary, marginTop: 16 }]}>
                Position / Title
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    borderColor: C.border,
                    color: C.text,
                    backgroundColor: C.backgroundSecondary,
                  },
                ]}
                value={p}
                onChangeText={setP}
                placeholder="e.g. Software Engineer"
                placeholderTextColor={C.textTertiary}
              />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;

  const { totalBalance, monthlyIncome, monthlyExpense, transactions, savingGoals, clearAllData } = useFinance();
  const { user, signOut } = useAuth();

  const metadata = user?.user_metadata || {};
  const occupation: string = metadata.occupation || "";
  const isStudent = occupation === "Student";
  const initialDisplayName = getDisplayName(user);
  const [name, setName] = useState(initialDisplayName);
  const [university, setUniversity] = useState(metadata.university || "");
  const [major, setMajor] = useState(metadata.major || "");
  const [position, setPosition] = useState(metadata.position || "");

  // Sync profile state when auth user object changes
  useEffect(() => {
    const meta = user?.user_metadata || {};
    setName(getDisplayName(user));
    setUniversity(meta.university || "");
    setMajor(meta.major || "");
    setPosition(meta.position || "");
  }, [user]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // Real AppLock state
  const { isAppLockEnabled, toggleAppLock, isBiometricAvailable } = useAppLock();

  const handleClearData = () => {
    setShowClearModal(true);
  };

  const confirmClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Toast.show({
        type: "success",
        text1: "Data Cleared",
        text2: "All your transactions and goals have been permanently deleted.",
      });
    } catch (_err) {
      Toast.show({
        type: "error",
        text1: "Clear Failed",
        text2: "Could not clear your data. Please try again.",
      });
    } finally {
      setIsClearing(false);
      setShowClearModal(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #0F172A; }
              h1 { color: #16A34A; margin-bottom: 5px; }
              h2 { font-weight: normal; color: #475569; margin-top: 0; }
              p { color: #64748B; font-size: 14px; }
              .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 30px; }
              .summary { display: flex; justify-content: space-between; background: #F8FAFC; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
              .stat { text-align: left; }
              .stat-label { font-size: 14px; color: #64748B; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
              .stat-value { font-size: 24px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px; }
              th, td { text-align: left; padding: 12px; border-bottom: 1px solid #E2E8F0; }
              th { background-color: #F8FAFC; color: #475569; font-weight: 600; }
              .income { color: #16A34A; }
              .expense { color: #DC2626; }
              .amount-cell { text-align: right; font-variant-numeric: tabular-nums; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CashBook</h1>
              <h2>Financial Report – ${name}</h2>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="summary">
              <div class="stat">
                <div class="stat-label">Total Balance</div>
                <div class="stat-value" style="color: ${totalBalance >= 0 ? '#16A34A' : '#DC2626'}">${formatAmount(totalBalance)}</div>
              </div>
              <div class="stat">
                <div class="stat-label">Monthly Income</div>
                <div class="stat-value income">${formatAmount(monthlyIncome)}</div>
              </div>
              <div class="stat">
                <div class="stat-label">Monthly Expense</div>
                <div class="stat-value expense">${formatAmount(monthlyExpense)}</div>
              </div>
            </div>

            <h3>Transaction History</h3>
            <table>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th style="text-align: right">Amount</th>
              </tr>
              ${transactions.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #94A3B8; padding: 30px;">No transactions found</td></tr>' : transactions.map(t => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.title}</td>
                  <td><span style="background: #F1F5F9; padding: 4px 8px; border-radius: 6px; font-size: 13px; color: #475569;">${t.category}</span></td>
                  <td class="amount-cell ${t.type}">${t.type === 'income' ? '+' : '-'}${formatAmount(t.amount)}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Financial Report',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Export Ready",
          text2: "PDF generated but sharing is not available on this device. File saved to: " + uri,
        });
      }
    } catch (error) {
      console.error("PDF Export error:", error);
      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: "Could not generate your PDF report.",
      });
    }
  };

  const txCount = transactions.length;
  const savings = monthlyIncome - monthlyExpense;
  const avatarInitial = getAvatarInitial(name);

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: C.background }]}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.body}>
          <View style={[styles.profileCard, { backgroundColor: C.backgroundCard }]}>
            <View style={styles.profileTop}>
              <View style={[styles.avatar, { backgroundColor: C.tint }]}>
                <Text style={styles.avatarText}>
                  {avatarInitial}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: C.text }]}>
                  {name}
                </Text>
                {isStudent ? (
                  <>
                    {university ? (
                      <Text style={[styles.profileUniversity, { color: C.textSecondary }]}>
                        {university}
                      </Text>
                    ) : null}
                    {major ? (
                      <Text style={[styles.profileMajor, { color: C.textTertiary }]}>
                        {major}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <>
                    {position ? (
                      <Text style={[styles.profileUniversity, { color: C.textSecondary }]}>
                        {position}
                      </Text>
                    ) : null}
                    <Text style={[styles.profileMajor, { color: C.textTertiary }]}>
                      Service Professional
                    </Text>
                  </>
                )}
              </View>
              <Pressable
                onPress={() => setShowEditModal(true)}
                style={[styles.editBtn, { backgroundColor: C.backgroundSecondary }]}
              >
                <Feather name="edit-2" size={15} color={C.textSecondary} />
              </Pressable>
            </View>

            <View style={[styles.statsRow, { borderTopColor: C.borderLight }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: C.text }]}>
                  {formatAmount(totalBalance)}
                </Text>
                <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                  Balance
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: C.borderLight }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: C.income }]}>
                  {formatAmount(savings)}
                </Text>
                <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                  Saved
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: C.borderLight }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: C.text }]}>
                  {txCount}
                </Text>
                <Text style={[styles.statLabel, { color: C.textSecondary }]}>
                  Transactions
                </Text>
              </View>
            </View>
          </View>

          {/* Notifications */}
          <SectionHeader title="Notifications" />
          <View style={[styles.settingsCard, { backgroundColor: C.backgroundCard }]}>
            <SettingRow
              icon="bell"
              iconBg="#EDE9FE"
              iconColor="#7C3AED"
              label="Push Notifications"
              showChevron={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(v) => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setNotificationsEnabled(v);
                  }}
                  trackColor={{ false: C.border, true: C.tint + "80" }}
                  thumbColor={notificationsEnabled ? C.tint : C.textTertiary}
                />
              }
            />
            <View style={[styles.rowDivider, { backgroundColor: C.borderLight }]} />
            <SettingRow
              icon="bar-chart-2"
              iconBg="#DCFCE7"
              iconColor="#16A34A"
              label="Weekly Report"
              showChevron={false}
              rightElement={
                <Switch
                  value={weeklyReport}
                  onValueChange={(v) => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setWeeklyReport(v);
                  }}
                  trackColor={{ false: C.border, true: C.tint + "80" }}
                  thumbColor={weeklyReport ? C.tint : C.textTertiary}
                />
              }
            />
          </View>

          {/* Preferences */}
          <SectionHeader title="Preferences" />
          <View style={[styles.settingsCard, { backgroundColor: C.backgroundCard }]}>
            <SettingRow
              icon="dollar-sign"
              iconBg="#FEF3C7"
              iconColor="#D97706"
              label="Currency"
              value={`${CURRENCY_SYMBOL} BDT`}
              onPress={() =>
                Alert.alert("Currency", "Currently set to BDT (৳). More currencies coming soon.")
              }
            />
            <View style={[styles.rowDivider, { backgroundColor: C.borderLight }]} />
            <SettingRow
              icon="calendar"
              iconBg="#DBEAFE"
              iconColor="#2563EB"
              label="Budget Period"
              value="Monthly"
              onPress={() =>
                Alert.alert("Budget Period", "Monthly period is currently selected.")
              }
            />
            <View style={[styles.rowDivider, { backgroundColor: C.borderLight }]} />
            {/* dark/light mode implement future */}
            {/* <SettingRow
              icon="sun"
              iconBg="#FEE2E2"
              iconColor="#DC2626"
              label="Theme"
              value="Light"
              onPress={() =>
                Alert.alert("Theme", "Light theme is active. Dark mode coming soon.")
              }
            /> */}
          </View>

          {/* Security */}
          <SectionHeader title="Security" />
          <View style={[styles.settingsCard, { backgroundColor: C.backgroundCard }]}>
            <SettingRow
              icon="lock"
              iconBg="#F1F5F9"
              iconColor="#475569"
              label="Biometric Lock"
              showChevron={false}
              rightElement={
                <Switch
                  value={isAppLockEnabled}
                  disabled={!isBiometricAvailable}
                  onValueChange={async () => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    if (!isBiometricAvailable) {
                      Alert.alert("Not Supported", "Biometric authentication is not set up or supported on this device.");
                      return;
                    }
                    await toggleAppLock();
                  }}
                  trackColor={{ false: C.border, true: C.tint + "80" }}
                  thumbColor={isAppLockEnabled ? C.tint : C.textTertiary}
                />
              }
            />
            <View style={[styles.rowDivider, { backgroundColor: C.borderLight }]} />
            <SettingRow
              icon="shield"
              iconBg="#F1F5F9"
              iconColor="#475569"
              label="Privacy Policy"
              onPress={() =>
                Toast.show({
                  type: "success",
                  text1: "Privacy Policy",
                  text2: "No data is shared with any third party. Your data is biometric protected.",
                })
              }
            />
          </View>

          {/* Data */}
          <SectionHeader title="Data" />
          <View style={[styles.settingsCard, { backgroundColor: C.backgroundCard }]}>
            <SettingRow
              icon="download"
              iconBg="#DCFCE7"
              iconColor="#16A34A"
              label="Export PDF"
              onPress={exportToPDF}
            />
            <View style={[styles.rowDivider, { backgroundColor: C.borderLight }]} />
            <SettingRow
              icon="trash-2"
              iconBg="#FEE2E2"
              iconColor="#DC2626"
              label="Clear All Data"
              onPress={handleClearData}
              showChevron={false}
              destructive
            />
            <View style={[styles.rowDivider, { backgroundColor: C.borderLight }]} />
            <SettingRow
              icon="log-out"
              iconBg="#FEE2E2"
              iconColor="#DC2626"
              label="Sign Out"
              onPress={() => setShowSignOutModal(true)}
            />
          </View>

          {/* About */}
          <SectionHeader title="About" />
          <View style={[styles.settingsCard, { backgroundColor: C.backgroundCard }]}>
            <SettingRow
              icon="info"
              iconBg="#F1F5F9"
              iconColor="#475569"
              label="Changelog"
              value="initial release 0.0.9"
              showChevron={false}
              onPress={() => setShowFeaturesModal(true)}
            />
            <View style={[styles.rowDivider, { backgroundColor: C.borderLight }]} />
            <SettingRow
              icon="star"
              iconBg="#FEF3C7"
              iconColor="#D97706"
              label="Rate the App"
              onPress={() =>
                Alert.alert("Thanks for interest!", "Rating will be available once the app is published.")
              }
            />
          </View>
          {/* App Version */}
          <Text style={{
            textAlign: 'center',
            marginTop: 32,
            marginBottom: 16,
            fontSize: 13,
            fontFamily: 'Inter_500Medium',
            color: C.textTertiary
          }}>
            Initial Release Version 0.0.9
          </Text>

        </View>
      </ScrollView>

      {/* Clear Data Confirmation Modal */}
      <Modal
        visible={showClearModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isClearing && setShowClearModal(false)}
      >
        <View style={clearStyles.overlay}>
          <Pressable
            style={clearStyles.backdropTouch}
            onPress={() => !isClearing && setShowClearModal(false)}
          />
          <View style={[clearStyles.card, { backgroundColor: C.backgroundCard }]}>
            {/* Warning Icon */}
            <View style={clearStyles.iconCircle}>
              <Feather name="alert-triangle" size={32} color="#fff" />
            </View>

            <Text style={[clearStyles.title, { color: C.text }]}>
              Clear All Data?
            </Text>
            <Text style={[clearStyles.description, { color: C.textSecondary }]}>
              This will permanently delete{"\n"}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: C.text }}>
                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
              </Text>
              {" and "}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: C.text }}>
                {savingGoals.length} goal{savingGoals.length !== 1 ? "s" : ""}
              </Text>
              {" from your account."}
            </Text>

            <View style={clearStyles.warningBadge}>
              <Feather name="info" size={14} color="#DC2626" />
              <Text style={clearStyles.warningText}>
                This action cannot be undone
              </Text>
            </View>

            {/* Buttons */}
            <View style={clearStyles.btnRow}>
              <Pressable
                onPress={() => setShowClearModal(false)}
                disabled={isClearing}
                style={({ pressed }) => [
                  clearStyles.btnCancel,
                  { borderColor: C.border },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[clearStyles.btnCancelText, { color: C.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmClearData}
                disabled={isClearing}
                style={({ pressed }) => [
                  clearStyles.btnDelete,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                  isClearing && { opacity: 0.6 },
                ]}
              >
                {isClearing ? (
                  <Text style={clearStyles.btnDeleteText}>Deleting...</Text>
                ) : (
                  <>
                    <Feather name="trash-2" size={16} color="#fff" />
                    <Text style={clearStyles.btnDeleteText}>Delete All</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={signOutStyles.overlay}>
          <Pressable
            style={signOutStyles.backdropTouch}
            onPress={() => setShowSignOutModal(false)}
          />
          <View style={[signOutStyles.card, { backgroundColor: C.backgroundCard }]}>
            {/* Icon */}
            <View style={signOutStyles.iconCircle}>
              <Feather name="log-out" size={28} color="#fff" />
            </View>

            <Text style={[signOutStyles.title, { color: C.text }]}>
              Sign Out?
            </Text>
            <Text style={[signOutStyles.description, { color: C.textSecondary }]}>
              You are currently signed in as{"\n"}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: C.text }}>
                {user?.email || "your account"}
              </Text>
            </Text>

            <View style={signOutStyles.infoBadge}>
              <Feather name="shield" size={14} color="#16A34A" />
              <Text style={signOutStyles.infoText}>
                Your data will be saved securely
              </Text>
            </View>

            {/* Buttons */}
            <View style={signOutStyles.btnRow}>
              <Pressable
                onPress={() => setShowSignOutModal(false)}
                style={({ pressed }) => [
                  signOutStyles.btnCancel,
                  { borderColor: C.border },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[signOutStyles.btnCancelText, { color: C.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowSignOutModal(false);
                  if (Platform.OS !== "web") {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                  Toast.show({
                    type: "info",
                    text1: "Signing Out",
                    text2: "You have been fully signed out.",
                  });
                  signOut();
                }}
                style={({ pressed }) => [
                  signOutStyles.btnSignOut,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Feather name="log-out" size={16} color="#fff" />
                <Text style={signOutStyles.btnSignOutText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>


      {/* Features Modal */}
      <Modal
        visible={showFeaturesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFeaturesModal(false)}
      >
        <View style={featuresStyles.overlay}>
          <Pressable
            style={featuresStyles.backdropTouch}
            onPress={() => setShowFeaturesModal(false)}
          />
          <View style={[featuresStyles.card, { backgroundColor: C.backgroundCard }]}>
            <View style={featuresStyles.headerRow}>
              <View style={featuresStyles.iconCircle}>
                <Feather name="layers" size={24} color="#3B82F6" />
              </View>
              <View>
                <Text style={[featuresStyles.title, { color: C.text }]}>What's New</Text>
                <Text style={[featuresStyles.subtitle, { color: C.textSecondary }]}>CashBook v0.0.9 Features</Text>
              </View>
            </View>

            <View style={featuresStyles.featureList}>
              <View style={featuresStyles.featureRow}>
                <View style={featuresStyles.featureIcon}>
                  <Feather name="shield" size={18} color="#10B981" />
                </View>
                <View style={featuresStyles.featureTextContent}>
                  <Text style={[featuresStyles.featureTitle, { color: C.text }]}>Biometric Lock</Text>
                  <Text style={[featuresStyles.featureDesc, { color: C.textSecondary }]}>Your financial data is protected by native FaceID and TouchID hardware.</Text>
                </View>
              </View>

              <View style={featuresStyles.featureRow}>
                <View style={featuresStyles.featureIcon}>
                  <Feather name="target" size={18} color="#8B5CF6" />
                </View>
                <View style={featuresStyles.featureTextContent}>
                  <Text style={[featuresStyles.featureTitle, { color: C.text }]}>Active Goals</Text>
                  <Text style={[featuresStyles.featureDesc, { color: C.textSecondary }]}>Visually map your savings targets with dynamic progress bars and emojis.</Text>
                </View>
              </View>

              <View style={featuresStyles.featureRow}>
                <View style={featuresStyles.featureIcon}>
                  <Feather name="file-text" size={18} color="#F59E0B" />
                </View>
                <View style={featuresStyles.featureTextContent}>
                  <Text style={[featuresStyles.featureTitle, { color: C.text }]}>PDF Export</Text>
                  <Text style={[featuresStyles.featureDesc, { color: C.textSecondary }]}>Generate and share beautiful financial HTML reports natively via iOS/Android.</Text>
                </View>
              </View>

              <View style={featuresStyles.featureRow}>
                <View style={featuresStyles.featureIcon}>
                  <Feather name="cloud" size={18} color="#06B6D4" />
                </View>
                <View style={featuresStyles.featureTextContent}>
                  <Text style={[featuresStyles.featureTitle, { color: C.text }]}>Cloud Edge Sync</Text>
                  <Text style={[featuresStyles.featureDesc, { color: C.textSecondary }]}>Your data instantly syncs securely across all devices through our storage.</Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => setShowFeaturesModal(false)}
              style={({ pressed }) => [
                featuresStyles.btnDone,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={featuresStyles.btnDoneText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <EditProfileModal
        visible={showEditModal}
        name={name}
        occupation={occupation}
        university={university}
        major={major}
        position={position}
        onSave={async (n, u, m, p) => {
          try {
            const nextMetadata: Record<string, any> = {
              ...(user?.user_metadata ?? {}),
              displayName: n,
              university: isStudent ? u : null,
              major: isStudent ? m : null,
              position: !isStudent ? p : null,
            };

            await supabase.auth.updateUser({
              data: {
                ...nextMetadata,
              }
            });

            if (user?.id) {
              const { firstName, lastName } = splitDisplayName(n);
              await supabase.from("profiles").upsert(
                {
                  id: user.id,
                  first_name: firstName,
                  last_name: lastName,
                  phone: nextMetadata.phone ?? null,
                  date_of_birth: nextMetadata.dob ?? null,
                  occupation: occupation,
                  university: isStudent ? u : null,
                  major: isStudent ? m : null,
                  position: !isStudent ? p : null,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "id" }
              );
            }

            // Only update local state after successful save
            setName(n);
            if (isStudent) {
              setUniversity(u);
              setMajor(m);
            } else {
              setPosition(p);
            }

            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Toast.show({
              type: "success",
              text1: "Profile Updated",
              text2: "Your changes have been saved.",
            });
          } catch (err) {
            console.error("Failed to update profile:", err);
            Toast.show({
              type: "error",
              text1: "Update Failed",
              text2: "Could not save your profile. Please try again.",
            });
          }
        }}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  body: {
    paddingHorizontal: 20,
    gap: 8,
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  profileUniversity: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  profileMajor: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: "100%",
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  rowDivider: {
    height: 1,
    marginLeft: 60,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  modalCancel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  modalSave: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  modalContent: {
    padding: 20,
  },
  modalAvatarWrap: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLargeText: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});

const clearStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 16,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#DC2626",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  btnDelete: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDeleteText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});

const signOutStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#475569",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 16,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#16A34A",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  btnSignOut: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnSignOutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});

const featuresStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  featureList: {
    gap: 22,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  btnDone: {
    width: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDoneText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});


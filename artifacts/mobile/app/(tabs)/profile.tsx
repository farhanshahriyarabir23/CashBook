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
import { formatAmount } from "@/utils/currency";
import { supabase } from "@/utils/supabase";

const C = Colors.light;

function splitDisplayName(displayName: string) {
  const [firstName, ...rest] = displayName.trim().split(/\s+/);

  return {
    firstName: firstName || "",
    lastName: rest.join(" ") || null,
  };
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
  university,
  major,
  onSave,
  onClose,
}: {
  visible: boolean;
  name: string;
  university: string;
  major: string;
  onSave: (n: string, u: string, m: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [n, setN] = useState(name);
  const [u, setU] = useState(university);
  const [m, setM] = useState(major);

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
              onSave(n, u, m);
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
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 + 34 : insets.bottom + 80;

  const { totalBalance, monthlyIncome, monthlyExpense, transactions } = useFinance();
  const { user, signOut } = useAuth();

  const metadata = user?.user_metadata || {};
  const [name, setName] = useState(metadata.displayName || "Student");
  const [university, setUniversity] = useState(metadata.university || "University of Dhaka");
  const [major, setMajor] = useState(metadata.major || "Computer Science");
  const [showEditModal, setShowEditModal] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your transactions and goals. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const txCount = transactions.length;
  const savings = monthlyIncome - monthlyExpense;

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
                  {(user?.email || name).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: C.text }]}>
                  {user?.email || name}
                </Text>
                <Text style={[styles.profileUniversity, { color: C.textSecondary }]}>
                  {university}
                </Text>
                <Text style={[styles.profileMajor, { color: C.textTertiary }]}>
                  {major}
                </Text>
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
            <SettingRow
              icon="sun"
              iconBg="#FEE2E2"
              iconColor="#DC2626"
              label="Theme"
              value="Light"
              onPress={() =>
                Alert.alert("Theme", "Light theme is active. Dark mode coming soon.")
              }
            />
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
                  value={biometricLock}
                  onValueChange={(v) => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setBiometricLock(v);
                  }}
                  trackColor={{ false: C.border, true: C.tint + "80" }}
                  thumbColor={biometricLock ? C.tint : C.textTertiary}
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
                  text2: "Your data is stored locally on your device.",
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
              label="Export Data"
              onPress={() =>
                Toast.show({
                  type: "success",
                  text1: "Coming Soon",
                  text2: "Data export will be available once cloud sync is connected.",
                })
              }
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
              onPress={() => {
                Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign Out", style: "destructive", onPress: signOut }
                ]);
              }}
            />
          </View>

          {/* About */}
          <SectionHeader title="About" />
          <View style={[styles.settingsCard, { backgroundColor: C.backgroundCard }]}>
            <SettingRow
              icon="info"
              iconBg="#F1F5F9"
              iconColor="#475569"
              label="Version"
              value="initial release 0.0.9"
              showChevron={false}
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
        </View>
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        name={name}
        university={university}
        major={major}
        onSave={async (n, u, m) => {
          setName(n);
          setUniversity(u);
          setMajor(m);
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          const nextMetadata = {
            ...(user?.user_metadata ?? {}),
            displayName: n,
            university: u,
            major: m,
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
                occupation: nextMetadata.occupation ?? null,
                university: u || null,
                major: m || null,
                position: nextMetadata.position ?? null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
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

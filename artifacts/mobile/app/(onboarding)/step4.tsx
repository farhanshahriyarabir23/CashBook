import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { useOnboarding } from "./_layout";
import { supabase } from "@/utils/supabase";
import { Toast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";

const C = Colors.light;

function splitDisplayName(displayName: string) {
  const [firstName, ...rest] = displayName.trim().split(/\s+/);

  return {
    firstName: firstName || "",
    lastName: rest.join(" ") || null,
  };
}

export default function Step4Screen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const { user } = useAuth();
  
  const [occupation, setOccupation] = useState<"Student" | "Service" | "">(data.occupation as any);
  const [university, setUniversity] = useState(data.university);
  const [major, setMajor] = useState(data.major);
  const [position, setPosition] = useState(data.position);
  const [loading, setLoading] = useState(false);

  const isFormValid = occupation === "Student" 
    ? (university.trim().length > 0 && major.trim().length > 0)
    : occupation === "Service"
    ? (position.trim().length > 0)
    : false;

  const handleComplete = async () => {
    if (!isFormValid || !user || loading) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setLoading(true);
    
    // Save locally to context 
    updateData({ occupation, university, major, position });

    try {
      const {
        data: { user: currentUser },
        error: currentUserError,
      } = await supabase.auth.getUser();

      if (currentUserError || !currentUser) {
        await supabase.auth.signOut({ scope: "local" });
        router.replace("/(auth)/login");
        throw new Error("Your session is no longer valid. Please sign in again.");
      }

      // Push all accumulated OnboardingData to Supabase user_metadata
      const metadata = {
        ...(currentUser.user_metadata ?? {}),
        displayName: data.name,
        phone: data.phone,
        dob: data.dob,
        occupation: occupation,
        university: occupation === "Student" ? university : null,
        major: occupation === "Student" ? major : null,
        position: occupation === "Service" ? position : null,
      };

      const { error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) throw error;

      const { firstName, lastName } = splitDisplayName(data.name);
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: currentUser.id,
          first_name: firstName,
          last_name: lastName,
          phone: data.phone,
          date_of_birth: data.dob,
          occupation,
          university: occupation === "Student" ? university : null,
          major: occupation === "Student" ? major : null,
          position: occupation === "Service" ? position : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (profileError) throw profileError;
      
      // Update successful. RootLayoutNav will detect updated `user_metadata` or we can explicitly route.
      router.replace("/(tabs)");
      
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error saving profile",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.backgroundCard }]}>
      <View style={[styles.header, { marginTop: insets.top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => { if (Platform.OS !== "web") Haptics.selectionAsync(); router.back(); }}>
          <Feather name="arrow-left" size={24} color={C.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: C.textSecondary }]}>Step 4 of 4</Text>
            <Text style={[styles.title, { color: C.text }]}>What is your occupation?</Text>
            
            <View style={styles.optionsContainer}>
              <Pressable
                style={[
                  styles.optionBtn,
                  { backgroundColor: occupation === "Student" ? C.tint : C.backgroundSecondary, borderColor: occupation === "Student" ? C.tint : C.border }
                ]}
                onPress={() => setOccupation("Student")}
              >
                <Text style={[styles.optionText, { color: occupation === "Student" ? "#FFFFFF" : C.text }]}>Student</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.optionBtn,
                  { backgroundColor: occupation === "Service" ? C.tint : C.backgroundSecondary, borderColor: occupation === "Service" ? C.tint : C.border }
                ]}
                onPress={() => setOccupation("Service")}
              >
                <Text style={[styles.optionText, { color: occupation === "Service" ? "#FFFFFF" : C.text }]}>Service</Text>
              </Pressable>
            </View>

            {occupation === "Student" && (
              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.input, { backgroundColor: C.backgroundSecondary, color: C.text, marginBottom: 12 }]}
                  placeholder="University"
                  placeholderTextColor={C.textTertiary}
                  value={university}
                  onChangeText={setUniversity}
                  selectionColor={C.tint}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: C.backgroundSecondary, color: C.text }]}
                  placeholder="Major / Department"
                  placeholderTextColor={C.textTertiary}
                  value={major}
                  onChangeText={setMajor}
                  selectionColor={C.tint}
                />
              </View>
            )}

            {occupation === "Service" && (
              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.input, { backgroundColor: C.backgroundSecondary, color: C.text }]}
                  placeholder="Position / Title"
                  placeholderTextColor={C.textTertiary}
                  value={position}
                  onChangeText={setPosition}
                  selectionColor={C.tint}
                />
              </View>
            )}

          </View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: isFormValid ? C.tint : C.border, opacity: pressed && isFormValid ? 0.9 : 1 },
              ]}
              onPress={handleComplete}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.submitBtnText, { color: isFormValid ? "#FFFFFF" : C.textSecondary }]}>Complete</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 12 },
  backButton: { padding: 8, marginLeft: -8, width: 40 },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  subtitle: { fontSize: 16, fontFamily: "Inter_500Medium", marginBottom: 8 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 24, lineHeight: 36 },
  optionsContainer: { flexDirection: "row", gap: 12, marginBottom: 24 },
  optionBtn: { flex: 1, height: 56, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  optionText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  formGroup: { width: "100%", marginTop: 8 },
  input: { height: 56, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, fontFamily: "Inter_500Medium" },
  footer: { paddingHorizontal: 24, paddingTop: 16 },
  submitBtn: { height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  submitBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});

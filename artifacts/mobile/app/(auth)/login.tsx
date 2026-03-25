import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Toast } from "@/components/Toast";
import { supabase } from "@/utils/supabase";
import Colors from "@/constants/colors";

const C = Colors.light;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);

  const isFormValid = email.length > 5 && password.length >= 6;

  const handleAuth = async () => {
    if (!isFormValid || loading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLoading(true);

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If email confirmation is disabled in Supabase, data.session will exist
        if (!data.session) {
          Toast.show({
            type: "success",
            text1: "Check your email",
            text2: "Account created successfully! Please confirm your email.",
          });
          setIsSignIn(true);
        }
        // If it does exist, AuthContext will auto-redirect them.
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Authentication Failed",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.backgroundCard }]}>
      <View style={[styles.header, { marginTop: insets.top + 16 }]}>
        <Pressable 
          style={styles.backButton}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            if (email || password) {
              setEmail("");
              setPassword("");
            } else {
              setIsSignIn(true);
            }
          }}
        >
          <Feather name="arrow-left" size={24} color={C.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
          <Text style={[styles.title, { color: C.text }]}>
            {isSignIn 
              ? "Sign in with your email to continue" 
              : "Create an account with your email"}
          </Text>

          <View style={styles.formGroup}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: C.backgroundSecondary, color: C.text }
              ]}
              placeholder="Email Address"
              placeholderTextColor={C.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              selectionColor={C.tint}
            />
            
            <TextInput
              style={[
                styles.input,
                { backgroundColor: C.backgroundSecondary, color: C.text, marginTop: 16 }
              ]}
              placeholder="Password"
              placeholderTextColor={C.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              selectionColor={C.tint}
            />
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { 
                backgroundColor: isFormValid ? C.tint : C.border,
                opacity: pressed && isFormValid ? 0.9 : 1,
              },
            ]}
            onPress={handleAuth}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={isFormValid ? "#fff" : C.textTertiary} />
            ) : (
              <Text 
                style={[
                  styles.submitBtnText, 
                  { color: isFormValid ? "#FFFFFF" : C.textSecondary }
                ]}
              >
                {isSignIn ? "Confirm" : "Sign Up"}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              setIsSignIn(!isSignIn);
              setEmail("");
              setPassword("");
            }}
            style={styles.toggleWrap}
          >
            <Text style={[styles.toggleText, { color: C.textSecondary }]}>
              {isSignIn ? "Create a new account instead" : "Sign in to existing account"}
            </Text>
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 32,
    lineHeight: 36,
  },
  formGroup: {
    width: "100%",
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  submitBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  toggleWrap: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});

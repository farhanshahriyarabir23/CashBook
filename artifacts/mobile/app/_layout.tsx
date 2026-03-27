import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import { FinanceProvider } from "@/context/FinanceContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLockProvider, useAppLock } from "@/context/AppLockContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// ── Lock Screen Overlay ───────────────────────────────────────────
function LockScreenOverlay() {
  const { isLocked, unlockApp } = useAppLock();

  if (!isLocked) return null;

  return (
    <View style={lockStyles.overlay}>
      {/* Frosted background */}
      <View style={lockStyles.backdrop} />

      <View style={lockStyles.content}>
        {/* Shield icon */}
        <View style={lockStyles.iconCircle}>
          <Feather name="lock" size={36} color="#fff" />
        </View>

        <Text style={lockStyles.title}>CashBook is Locked</Text>
        <Text style={lockStyles.subtitle}>
          Authenticate to access your financial data
        </Text>

        <Pressable
          onPress={unlockApp}
          style={({ pressed }) => [
            lockStyles.unlockBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Feather
            name={Platform.OS === "ios" ? "smartphone" : "unlock"}
            size={20}
            color="#fff"
          />
          <Text style={lockStyles.unlockText}>
            {Platform.OS === "ios" ? "Unlock with Face ID" : "Unlock with Biometrics"}
          </Text>
        </Pressable>
      </View>

      <Text style={lockStyles.footer}>Your data is protected</Text>
    </View>
  );
}

const lockStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0F172A",
    opacity: 0.97,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#F8FAFC",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 20,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#16A34A",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  unlockText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  footer: {
    position: "absolute",
    bottom: 50,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#475569",
  },
});

// ── Navigation Guard ──────────────────────────────────────────────
function RootLayoutNav() {
  const { session, user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onboardingSteps = new Set(["step1", "step2", "step3", "step4"]);
    const inOnboardingGroup =
      segments[0] === "(onboarding)" ||
      onboardingSteps.has(segments[0] ?? "") ||
      onboardingSteps.has(segments[segments.length - 1] ?? "");

    const hasCompletedOnboarding = !!user?.user_metadata?.displayName;

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login" as any);
    } else if (session) {
      if (!hasCompletedOnboarding && !inOnboardingGroup) {
        router.replace("/(onboarding)/step1" as any);
      } else if (hasCompletedOnboarding && (inAuthGroup || inOnboardingGroup)) {
        router.replace("/(tabs)" as any);
      }
    }
  }, [session, user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
    </Stack>
  );
}

// ── Root Layout ───────────────────────────────────────────────────
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    console.log("Font load status:", { fontsLoaded, fontError });
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(err => console.error("Splash hide error:", err));
    }
  }, [fontsLoaded, fontError]);

  // Safety timeout: Force hide splash after 10 seconds even if fonts don't load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fontsLoaded && !fontError) {
        console.warn("Force hiding splash screen after timeout (fonts may have failed to load)");
        SplashScreen.hideAsync().catch(console.error);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <AppLockProvider>
                  <FinanceProvider>
                    <RootLayoutNav />
                    <LockScreenOverlay />
                    <ToastProvider />
                  </FinanceProvider>
                </AppLockProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}


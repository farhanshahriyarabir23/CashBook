import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Hardcoded fallbacks – guarantees the keys are available even when
// Constants.expoConfig.extra and process.env are empty in EAS builds.
const FALLBACK_SUPABASE_URL = "https://lsdmoshgskcacpfnngwy.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZG1vc2hnc2tjYWNwZm5uZ3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzU5NzksImV4cCI6MjA4MjMxMTk3OX0.58TKkGuSEQjKSmzS5GwaR4ZnYPaMXARSQvDtxqYWo0E";

// Try multiple sources and sanitize against stray quotes or literal undefined strings
const cleanKey = (key: string | undefined | null) => {
  if (!key) return null;
  const cleaned = key.replace(/^["']|["']$/g, "").trim();
  if (cleaned === "undefined" || cleaned === "null" || cleaned === "") return null;
  return cleaned;
};

const supabaseUrl =
  cleanKey(Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL) ??
  cleanKey(process.env.EXPO_PUBLIC_SUPABASE_URL) ??
  FALLBACK_SUPABASE_URL;

const supabaseAnonKey =
  cleanKey(Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY) ??
  cleanKey(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) ??
  FALLBACK_SUPABASE_ANON_KEY;

if (__DEV__) {
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Key present:", !!supabaseAnonKey && supabaseAnonKey.length > 20);
}

if (!supabaseUrl && Platform.OS !== "web") {
  console.warn("DATABASE URL is not configured.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

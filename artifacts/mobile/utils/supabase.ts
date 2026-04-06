import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Try multiple sources and sanitize against stray quotes (a common EAS artifact)
const cleanKey = (key: string | undefined) => key?.replace(/^["']|["']$/g, '')?.trim();

const supabaseUrl = cleanKey(
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL
  ) || "";

const supabaseAnonKey = cleanKey(
    Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ) || "";

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

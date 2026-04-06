import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

  console.log("EXPO_PUBLIC_SUPABASE_URL set:", !!supabaseUrl);
  console.log("EXPO_PUBLIC_SUPABASE_ANON_KEY set:", !!supabaseAnonKey);

  // Only override app.json values if env vars are actually present
  // Otherwise undefined will destroy the valid keys from app.json
  const extraOverrides: Record<string, string> = {};
  if (supabaseUrl) extraOverrides.EXPO_PUBLIC_SUPABASE_URL = supabaseUrl;
  if (supabaseAnonKey) extraOverrides.EXPO_PUBLIC_SUPABASE_ANON_KEY = supabaseAnonKey;

  return {
    ...config,
    extra: {
      ...config.extra,
      ...extraOverrides,
    },
  } as ExpoConfig;
};

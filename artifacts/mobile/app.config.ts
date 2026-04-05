import "dotenv/config";
import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  console.log("EXPO_PUBLIC_SUPABASE_URL set:", !!supabaseUrl);
  console.log("EXPO_PUBLIC_SUPABASE_ANON_KEY set:", !!supabaseAnonKey);

  return {
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    },
  } as ExpoConfig;
};

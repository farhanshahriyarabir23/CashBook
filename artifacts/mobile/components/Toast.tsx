import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

type ToastType = "success" | "error" | "info";

interface ToastData {
  type: ToastType;
  text1: string;
  text2?: string;
  duration?: number;
}

// Singleton pattern so we can call Toast.show() from anywhere
let globalShow: ((data: ToastData) => void) | null = null;

export const Toast = {
  show: (data: ToastData) => {
    if (globalShow) globalShow(data);
  },
};

const ICON_MAP: Record<ToastType, { name: any; color: string }> = {
  success: { name: "check-circle", color: "#16A34A" },
  error: { name: "alert-circle", color: "#DC2626" },
  info: { name: "info", color: "#2563EB" },
};

export function ToastProvider() {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState<ToastData | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [translateY, opacity]);

  const show = useCallback(
    (data: ToastData) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast(data);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(hide, data.duration || 3000);
    },
    [translateY, opacity, hide]
  );

  useEffect(() => {
    globalShow = show;
    return () => {
      globalShow = null;
    };
  }, [show]);

  if (!toast) return null;

  const icon = ICON_MAP[toast.type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 12,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.pill}>
        <Feather name={icon.name} size={20} color={icon.color} />
        <View style={styles.textWrap}>
          <Text style={styles.title}>{toast.text1}</Text>
          {toast.text2 ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {toast.text2}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: "#F1F5F9",
    maxWidth: 400,
    width: "100%",
  },
  textWrap: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    marginTop: 2,
  },
});

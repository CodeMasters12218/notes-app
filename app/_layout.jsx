// app/_layout.jsx
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/i18n"; // importa la config de i18n

// Botón de logout en el header
function HeaderLogout() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}

// Layout raíz
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("You need permissions to send notifications!");
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#ff8c00",
                },
                headerTintColor: "#ffffff",
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: "bold",
                },
                headerRight: () => <HeaderLogout />,
                contentStyle: {
                  paddingHorizontal: 10,
                  paddingTop: 10,
                  backgroundColor: "#fff",
                },
              }}
            >
              <Stack.Screen name="index" options={{ title: "Home" }} />
              <Stack.Screen name="notes" options={{ headerTitle: "Notes" }} />
              <Stack.Screen name="auth" options={{ headerTitle: "Login" }} />
              <Stack.Screen name="drawscreen" options={{ headerTitle: "Draw Screen" }} />
            </Stack>
          </View>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    marginRight: 15,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

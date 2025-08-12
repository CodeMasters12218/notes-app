import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const HeaderLogout = () => {
  const { user, logout } = useAuth();

  return user ? (
    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  ) : null;
};

const RootLayout = () => {
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
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#ff8c00",
            },
            headerTintColor: "#fff",
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
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

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

export default RootLayout;

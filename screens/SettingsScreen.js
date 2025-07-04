import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Button,
} from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext";
import { useNavigation } from "@react-navigation/native";
import auth from "@react-native-firebase/auth";

const SettingsScreen = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { notificationsEnabled, setNotificationsEnabled } =
    useContext(NotificationContext);
  const navigation = useNavigation();

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Permission Denied",
          "To receive budget alerts, enable notifications in your device settings."
        );
        return false;
      }
    }
    return true;
  };

  const handleToggleNotifications = async (value) => {
    if (Platform.OS === "web") return; // Skip on web

    if (value) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();

        if (newStatus !== "granted") {
          Alert.alert(
            "Notifications Denied",
            "Please allow notifications in settings."
          );
          return;
        }
      }
    }

    setNotificationsEnabled(value);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Receipts?",
      "This will delete all your saved receipts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: () => {
            // Add your context clear function here
            console.log("Receipts cleared");
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      Alert.alert("Signed Out", "You have been logged out.");
      navigation.replace("Auth");
    } catch (error) {
      Alert.alert("Sign Out Failed", error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Error", "No user is currently signed in.");
      return;
    }

    try {
      await user.delete(); // Only works if user recently signed in
      Alert.alert("Account deleted", "Your account has been removed.");
      navigation.replace("Auth");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Re-authentication Required",
          "Please sign in again to delete your account."
        );
      } else {
        Alert.alert("Delete Failed", error.message);
      }
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete Account?",
      "Are you sure you want to permanently delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: handleDeleteAccount, style: "destructive" },
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>✅ Settings works</Text>
      <View style={styles.settingRow}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>
      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: theme.danger }]}
        onPress={() => alert("This would clear receipts")}
      >
        <Text style={{ color: theme.buttonText }}>🗑️ Clear All Receipts</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 20 }}>
        <Text style={{ color: "red", fontSize: 16 }}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={confirmDeleteAccount}
        style={{ marginTop: 10 }}
      >
        <Text style={{ color: "red", fontSize: 16 }}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screen,
  },
  header: {
    fontSize: 24,
    marginBottom: spacing.betweenElements,
    textAlign: "center",
    marginTop: 50,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.betweenElements,
  },
  clearButton: {
    marginTop: 40,
    padding: spacing.inputPadding,
    borderRadius: radius.medium,
  },
  version: {
    marginTop: 60,
    textAlign: "center",
  },
});

export default SettingsScreen;

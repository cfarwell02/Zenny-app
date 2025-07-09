import React, { useContext } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext";
import auth from "@react-native-firebase/auth";

const SettingsScreen = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { notificationsEnabled, setNotificationsEnabled } =
    useContext(NotificationContext);

  const theme = darkMode ? darkTheme : lightTheme;

  const handleToggleNotifications = async (value) => {
    if (Platform.OS === "web") return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Enable notifications in settings to receive reminders."
        );
        return;
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
      await user.delete();
      Alert.alert("Account deleted", "Your account has been removed.");
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.header, { color: theme.text }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Preferences
          </Text>

          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>
              Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.danger }]}
            onPress={handleClearData}
          >
            <Text style={styles.buttonText}>🗑️ Clear All Receipts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#999" }]}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>🚪 Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#cc0000" }]}
            onPress={confirmDeleteAccount}
          >
            <Text style={styles.buttonText}>⚠️ Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.screen,
    flexGrow: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  label: {
    fontSize: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default SettingsScreen;

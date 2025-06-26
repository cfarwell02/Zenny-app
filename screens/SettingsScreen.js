import React, { useContext } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext"; // ✅ FIXED
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";

const SettingsScreen = () => {
  const { notificationsEnabled, setNotificationsEnabled } =
    useContext(NotificationContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const handleToggleNotifications = async (value) => {
    if (value) {
      const { status } = await Notifications.getPermissionsAsync();
      console.log("Notification Permissions:", status);
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "To receive budget alerts, enable notifications in your device settings."
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Settings</Text>

      <View style={styles.settingRow}>
        <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.settingRow}>
        <Text style={[styles.label, { color: theme.text }]}>Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
        />
      </View>

      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: theme.danger }]}
        onPress={handleClearData}
      >
        <Text style={{ color: theme.buttonText }}>🗑️ Clear All Receipts</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: theme.subtleText }]}>
        Zenny v1.0.0
      </Text>
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

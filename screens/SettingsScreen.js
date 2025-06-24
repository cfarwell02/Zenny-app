import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { ThemeContext } from "../context/ThemeContext";

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

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
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.label}>Notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
        <Text style={styles.clearText}>🗑️ Clear All Receipts</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Zenny v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  darkBackground: {
    backgroundColor: "#1c1c1e",
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  darkText: {
    color: "#fff",
  },
  clearButton: {
    marginTop: 40,
    padding: 12,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
  },
  clearText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  version: {
    marginTop: 60,
    textAlign: "center",
    color: "#999",
  },
});

export default SettingsScreen;

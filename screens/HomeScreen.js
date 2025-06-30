import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Button } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { lightTheme, darkTheme } from "../constants/themes";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome to Zenny!
        </Text>
      </View>

      {/* Centered Button Group */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Saved Receipts")}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            🧾 View Receipts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Add Receipt")}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            ➕ Add Receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("My Budget")}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            💰 My Budget
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Statistics")}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            📊 View Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            ⚙️ Settings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    paddingTop: 100,
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
  },
  buttonGroup: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 200,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
  },
});

export default HomeScreen;

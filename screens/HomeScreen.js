import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
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
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome to <Text style={styles.zenny}>Zenny</Text>!
        </Text>

        <View style={styles.buttonGroup}>
          {[
            { label: "🧾 View Receipts", screen: "Saved Receipts" },
            { label: "➕ Add Receipt", screen: "Add Receipt" },
            { label: "💰 Budgets", screen: "My Budget" },
            { label: "📊 Stats", screen: "Statistics" },
            { label: "💼 Income Tracker", screen: "Income" }, // New
            { label: "🎯 Savings Goal", screen: "SavingsGoal" },
            { label: "⚙️ Settings", screen: "Settings" },
          ].map(({ label, screen }) => (
            <TouchableOpacity
              key={screen}
              style={[
                styles.button,
                {
                  backgroundColor: theme.primary,
                  shadowColor: theme.text,
                },
              ]}
              onPress={() => navigation.navigate(screen)}
              activeOpacity={0.85}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 40,
    textAlign: "center",
  },
  zenny: {
    color: "#4CAF50", // Accent for app name
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "90%",
    paddingVertical: 14,
    marginBottom: 20, // Increased spacing between buttons
    borderRadius: radius.large,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default HomeScreen;

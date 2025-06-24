import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { lightTheme, darkTheme } from "../constants/themes";

const HomeScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Welcome to Zenny!
      </Text>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.screen,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: spacing.large,
    textAlign: "center",
  },
  button: {
    paddingVertical: spacing.inputPadding,
    paddingHorizontal: spacing.screen,
    borderRadius: radius.medium,
    marginBottom: spacing.betweenElements,
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default HomeScreen;

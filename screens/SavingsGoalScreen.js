import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { LinearGradient } from "expo-linear-gradient"; // install with: expo install expo-linear-gradient

const SavingsGoalScreen = () => {
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const [goalAmount, setGoalAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");

  const parsedGoal = parseFloat(goalAmount);
  const parsedSaved = parseFloat(savedAmount);

  const progress =
    !isNaN(parsedGoal) && parsedGoal > 0 && !isNaN(parsedSaved)
      ? Math.min(parsedSaved / parsedGoal, 1)
      : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.container]}
      >
        <Text style={[styles.header, { color: theme.text }]}>
          🎯 Savings Goal
        </Text>
        <Text style={[styles.subtext, { color: theme.subtleText }]}>
          Set a savings target and track your progress toward it!
        </Text>

        <TextInput
          placeholder="Goal Amount"
          value={goalAmount}
          onChangeText={setGoalAmount}
          keyboardType="decimal-pad"
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.subtleText,
            },
          ]}
          placeholderTextColor={theme.subtleText}
        />
        <TextInput
          placeholder="Amount Saved"
          value={savedAmount}
          onChangeText={setSavedAmount}
          keyboardType="decimal-pad"
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.subtleText,
            },
          ]}
          placeholderTextColor={theme.subtleText}
        />

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <LinearGradient
            colors={["#4caf50", "#81c784"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${progress * 100}%` }]}
          />
        </View>

        {/* Feedback Text */}
        <Text style={[styles.progressText, { color: theme.text }]}>
          {progress === 1
            ? "🎉 Goal Reached! Great job!"
            : `💸 ${Math.round(progress * 100)}% saved`}
        </Text>

        {/* Breakdown */}
        <Text style={[styles.breakdown, { color: theme.subtleText }]}>
          Saved ${savedAmount || "0"} of ${goalAmount || "0"}
        </Text>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => alert("💾 Saving to storage coming soon!")}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Save Progress
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtext: { fontSize: 14, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  progressContainer: {
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 20,
  },
  progressBar: {
    height: "100%",
    borderRadius: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  breakdown: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});

export default SavingsGoalScreen;

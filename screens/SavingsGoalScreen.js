import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Target, Plus } from "lucide-react-native";
import { ThemeContext } from "../context/ThemeContext"; // ✅ adjust path as needed
import { lightTheme, darkTheme } from "../constants/themes";

const { width } = Dimensions.get("window");

const SavingsGoalScreen = () => {
  const { darkMode } = useContext(ThemeContext); // ✅ access theme from context
  const theme = darkMode ? darkTheme : lightTheme; // ✅ Pick the active theme

  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");

  const addGoal = () => {
    if (!goalName || !goalAmount || !savedAmount) return;
    const newGoal = {
      id: Date.now().toString(),
      name: goalName,
      goal: parseFloat(goalAmount),
      saved: parseFloat(savedAmount),
    };
    setGoals([newGoal, ...goals]);
    setGoalName("");
    setGoalAmount("");
    setSavedAmount("");
  };

  const adjustSavedAmount = (goalId, amount) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, saved: Math.max(0, goal.saved + amount) }
          : goal
      )
    );
  };

  const formatCurrency = (amount) => `$${Math.round(amount).toLocaleString()}`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.header, { color: theme.text }]}>
          🎯 Your Savings Goals
        </Text>

        <View style={styles.inputSection}>
          <TextInput
            placeholder="Goal name (e.g., Vacation)"
            value={goalName}
            onChangeText={setGoalName}
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: theme.cardBg,
              },
            ]}
            placeholderTextColor={theme.subtleText}
          />
          <TextInput
            placeholder="Target Amount"
            value={goalAmount}
            onChangeText={setGoalAmount}
            keyboardType="numeric"
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: theme.cardBg,
              },
            ]}
            placeholderTextColor={theme.subtleText}
          />
          <TextInput
            placeholder="Amount Already Saved"
            value={savedAmount}
            onChangeText={setSavedAmount}
            keyboardType="numeric"
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: theme.cardBg,
              },
            ]}
            placeholderTextColor={theme.subtleText}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={addGoal}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Add Goal</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Target size={48} color={theme.subtleText} />
            <Text style={[styles.emptyText, { color: theme.subtleText }]}>
              No goals yet
            </Text>
            <Text style={[styles.emptySub, { color: theme.subtleText }]}>
              Add a savings goal to get started
            </Text>
          </View>
        ) : (
          goals.map((goal) => {
            const progress = Math.min(goal.saved / goal.goal, 1);
            const progressPct = Math.round(progress * 100);
            const remaining = goal.goal - goal.saved;

            return (
              <View
                key={goal.id}
                style={[
                  styles.card,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.cardBg,
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {goal.name}
                </Text>
                <Text style={{ color: theme.subtleText }}>
                  {formatCurrency(goal.saved)} of {formatCurrency(goal.goal)}
                </Text>

                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: theme.success,
                        width: `${progressPct}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={{ textAlign: "center", color: theme.primary }}>
                  {progressPct}% complete
                </Text>
                <Text style={{ color: theme.text, marginTop: 8 }}>
                  Remaining: {formatCurrency(remaining)}
                </Text>

                <View style={styles.quickRow}>
                  {[10, 25, 50].map((amt) => (
                    <TouchableOpacity
                      key={`plus-${amt}`}
                      style={[
                        styles.quickButton,
                        { borderColor: theme.success },
                      ]}
                      onPress={() => adjustSavedAmount(goal.id, amt)}
                    >
                      <Text style={{ color: theme.success }}>+{amt}</Text>
                    </TouchableOpacity>
                  ))}
                  {[10, 25, 50].map((amt) => (
                    <TouchableOpacity
                      key={`minus-${amt}`}
                      style={[
                        styles.quickButton,
                        { borderColor: theme.danger },
                      ]}
                      onPress={() => adjustSavedAmount(goal.id, -amt)}
                    >
                      <Text style={{ color: theme.danger }}>-{amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#d1d5db",
    borderRadius: 5,
    marginVertical: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 10,
  },
  quickButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default SavingsGoalScreen;

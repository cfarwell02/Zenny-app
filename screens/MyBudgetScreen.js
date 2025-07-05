import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { BudgetContext } from "../context/BudgetContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";

const MyBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, expenses } = useContext(BudgetContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const categorySpent = {};
  expenses.forEach((e) => {
    categorySpent[e.category] = (categorySpent[e.category] || 0) + e.amount;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.header, { color: theme.text }]}>
          💰 My Budgets
        </Text>

        {Object.keys(categoryBudgets).map((category) => {
          const budget = categoryBudgets[category];
          const spent = categorySpent[category] || 0;
          const remaining = budget - spent;

          return (
            <View
              key={category}
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.category, { color: theme.text }]}>
                {category}
              </Text>

              {budget === 0 ? (
                <Text
                  style={[
                    styles.detail,
                    {
                      color: theme.subtleText || theme.text,
                      fontStyle: "italic",
                    },
                  ]}
                >
                  No budget set for "{category}" yet.
                </Text>
              ) : (
                <>
                  <Text style={[styles.detail, { color: theme.text }]}>
                    Budget: ${(parseFloat(budget) || 0).toFixed(2)}
                  </Text>
                  <Text style={[styles.detail, { color: theme.text }]}>
                    Spent: ${(spent ?? 0).toFixed(2)}
                  </Text>
                  <Text style={[styles.detail, { color: theme.text }]}>
                    Remaining: ${(remaining ?? 0).toFixed(2)}
                  </Text>
                </>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={[
            styles.manageButton,
            { backgroundColor: theme.primary },
            { marginBottom: 16 },
          ]}
          onPress={() => navigation.navigate("Manage Categories")}
        >
          <Text style={[styles.manageText, { color: theme.buttonText }]}>
            ✏️ Manage Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.manageButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("Manage Budgets")}
        >
          <Text style={[styles.manageText, { color: theme.buttonText }]}>
            ✏️ Manage Budgets
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.screen,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: radius.medium,
    marginBottom: 16,
  },
  category: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  detail: {
    fontSize: 16,
  },
  manageButton: {
    padding: 14,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  manageText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyBudgetScreen;

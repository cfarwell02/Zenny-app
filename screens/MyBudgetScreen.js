import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";

const MyBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, expenses } = useContext(BudgetContext);
  const { categories } = useContext(CategoryContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const categorySpent = {};
  expenses.forEach((e) => {
    categorySpent[e.category] = (categorySpent[e.category] || 0) + e.amount;
  });

  const allRelevantCategories = [
    ...new Set([
      ...categories.filter(
        (cat) =>
          categoryBudgets.hasOwnProperty(cat) ||
          categorySpent.hasOwnProperty(cat)
      ),
      ...Object.keys(categoryBudgets).filter((cat) => categories.includes(cat)),
      ...Object.keys(categorySpent).filter((cat) => categories.includes(cat)),
    ]),
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: theme.background },
        ]}
      >
        <View style={styles.inner}>
          <Text style={[styles.header, { color: theme.text }]}>
            💰 My Budgets
          </Text>

          {allRelevantCategories.length === 0 ? (
            <Text
              style={{
                color: theme.subtleText || theme.text,
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              No budgets or expenses yet. Start by adding a receipt or setting a
              budget.
            </Text>
          ) : (
            allRelevantCategories.map((category) => {
              const budget = categoryBudgets[category] || 0;
              const spent = categorySpent[category] || 0;
              const remaining = budget - spent;

              return (
                <View
                  key={category}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      shadowColor: theme.text,
                    },
                  ]}
                >
                  <Text style={[styles.category, { color: theme.text }]}>
                    {category}
                  </Text>

                  {budget === 0 ? (
                    <Text
                      style={{
                        color: theme.subtleText || theme.text,
                        fontStyle: "italic",
                      }}
                    >
                      No budget set for "{category}" yet.
                    </Text>
                  ) : (
                    <>
                      <Text style={[styles.detail, { color: theme.text }]}>
                        Budget: ${budget.toFixed(2)}
                      </Text>
                      <Text style={[styles.detail, { color: theme.text }]}>
                        Spent: ${spent.toFixed(2)}
                      </Text>
                      <Text style={[styles.detail, { color: theme.text }]}>
                        Remaining: ${remaining.toFixed(2)}
                      </Text>
                    </>
                  )}
                </View>
              );
            })
          )}

          <TouchableOpacity
            style={[styles.manageButton, { backgroundColor: theme.primary }]}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  inner: {
    paddingTop: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.large,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  category: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 2,
  },
  manageButton: {
    paddingVertical: 14,
    borderRadius: radius.medium,
    alignItems: "center",
    marginTop: 12,
  },
  manageText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyBudgetScreen;

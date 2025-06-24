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

const MyBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, expenses } = useContext(BudgetContext);

  // Total spent per category
  const categorySpent = {};
  expenses.forEach((e) => {
    categorySpent[e.category] = (categorySpent[e.category] || 0) + e.amount;
  });

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>💰 My Budgets</Text>

        {Object.keys(categoryBudgets).map((category) => {
          const budget = categoryBudgets[category];
          const spent = categorySpent[category] || 0;
          const remaining = budget - spent;

          return (
            <View key={category} style={styles.card}>
              <Text style={styles.category}>{category}</Text>
              <Text style={styles.detail}>Budget: ${budget.toFixed(2)}</Text>
              <Text style={styles.detail}>Spent: ${spent.toFixed(2)}</Text>
              <Text style={styles.detail}>
                Remaining: ${remaining.toFixed(2)}
              </Text>
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => navigation.navigate("Manage Budgets")}
        >
          <Text style={styles.manageText}>✏️ Manage Category Budgets</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
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
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  manageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyBudgetScreen;

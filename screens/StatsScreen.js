import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { BudgetContext } from "../context/BudgetContext"; // adjust path
import * as Notifications from "expo-notifications";

const StatsScreen = () => {
  const { budget, threshold, expenses } = useContext(BudgetContext);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const usagePercent = budget > 0 ? (totalSpent / budget) * 100 : 0;

  useEffect(() => {
    if (budget > 0 && usagePercent >= threshold) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Zenny Budget Alert 💸",
          body: `You've used ${Math.round(usagePercent)}% of your budget!`,
        },
        trigger: null,
      });
    }
  }, [expenses]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Monthly Budget: ${budget}</Text>
        <Text style={styles.subtitle}>Spent: ${totalSpent.toFixed(2)}</Text>
        <Text style={styles.subtitle}>Used: {Math.round(usagePercent)}%</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 18, marginTop: 10 },
});

export default StatsScreen;

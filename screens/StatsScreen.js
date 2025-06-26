import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { BudgetContext } from "../context/BudgetContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { PieChart } from "react-native-chart-kit";

const StatsScreen = () => {
  const { expenses } = useContext(BudgetContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const categorySpent = {};
  expenses.forEach((e) => {
    categorySpent[e.category] = (categorySpent[e.category] || 0) + e.amount;
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const mostSpent = Object.entries(categorySpent).reduce(
    (max, [cat, amt]) =>
      amt > max.amount ? { category: cat, amount: amt } : max,
    { category: null, amount: 0 }
  );

  const screenWidth = Dimensions.get("window").width;

  const pieData = Object.entries(categorySpent).map(
    ([category, amount], index) => ({
      name: category,
      amount,
      color: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"][index % 5],
      legendFontColor: theme.text,
      legendFontSize: 14,
    })
  );

  return (
    <SafeAreaView style={{ backgroundColor: theme.background, flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.header, { color: theme.text }]}>
          📈 Spending Stats
        </Text>
        <Text style={[styles.total, { color: theme.text }]}>
          Total Spent: ${totalSpent.toFixed(2)}
        </Text>

        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: theme.background,
            backgroundGradientFrom: theme.background,
            backgroundGradientTo: theme.background,
            color: (opacity = 1) => theme.text,
            labelColor: () => theme.text,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />

        {Object.entries(categorySpent).map(([category, amount]) => (
          <View key={category} style={styles.statRow}>
            <Text style={[styles.label, { color: theme.text }]}>
              {category}:
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              ${amount.toFixed(2)}
            </Text>
          </View>
        ))}

        {mostSpent.category && (
          <Text
            style={[
              styles.tip,
              { backgroundColor: theme.card, color: theme.text },
            ]}
          >
            💡 You spent the most on{" "}
            <Text style={{ fontWeight: "bold" }}>{mostSpent.category}</Text> ($
            {mostSpent.amount.toFixed(2)}). Consider budgeting more carefully in
            this area!
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  total: { fontSize: 18, marginBottom: 20 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: { fontSize: 16 },
  value: { fontSize: 16, fontWeight: "600" },
  tip: {
    marginTop: 30,
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
  },
});

export default StatsScreen;

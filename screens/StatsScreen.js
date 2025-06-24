import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { BudgetContext } from "../context/BudgetContext";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const StatsScreen = () => {
  const { expenses } = useContext(BudgetContext);

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
      legendFontColor: "#333",
      legendFontSize: 14,
    })
  );

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>📈 Spending Stats</Text>

        <Text style={styles.total}>Total Spent: ${totalSpent.toFixed(2)}</Text>

        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: () => "#333",
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />

        {Object.entries(categorySpent).map(([category, amount]) => (
          <View key={category} style={styles.statRow}>
            <Text style={styles.label}>{category}:</Text>
            <Text style={styles.value}>${amount.toFixed(2)}</Text>
          </View>
        ))}

        {mostSpent.category && (
          <Text style={styles.tip}>
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
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
  },
});

export default StatsScreen;

import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 60,
          backgroundColor: theme.background,
        }}
      >
        <Text style={[styles.header, { color: theme.text }]}>
          📈 Spending Stats
        </Text>

        {totalSpent === 0 ? (
          <Text
            style={{
              color: theme.subtleText,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No expenses recorded yet. Start by adding a receipt!
          </Text>
        ) : (
          <>
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
                color: () => theme.text,
                labelColor: () => theme.text,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
            />

            {Object.entries(categorySpent).map(([category, amount]) => (
              <View
                key={category}
                style={[styles.statCard, { backgroundColor: theme.card }]}
              >
                <Text style={[styles.statLabel, { color: theme.text }]}>
                  {category}
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  ${amount.toFixed(2)} (
                  {((amount / totalSpent) * 100).toFixed(1)}%)
                </Text>
              </View>
            ))}

            {mostSpent.category && (
              <Text
                style={[
                  styles.tip,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderLeftColor: "#FF6384",
                  },
                ]}
              >
                💡 You spent the most on{" "}
                <Text style={{ fontWeight: "bold" }}>{mostSpent.category}</Text>{" "}
                ($
                {mostSpent.amount.toFixed(2)}). Consider budgeting more
                carefully in this area!
              </Text>
            )}

            <TouchableOpacity
              style={{
                marginTop: 24,
                padding: 14,
                borderRadius: 10,
                backgroundColor: theme.primary,
                alignSelf: "center",
              }}
              onPress={() => alert("Export as PDF or Email coming soon!")}
            >
              <Text style={{ color: theme.buttonText, fontWeight: "600" }}>
                📤 Export Report
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, marginTop: 20 },
  total: { fontSize: 18, marginBottom: 20 },
  statCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  tip: {
    marginTop: 30,
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
});

export default StatsScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
} from "react-native-chart-kit";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";

const { width: screenWidth } = Dimensions.get("window");

// Enhanced Spending by Category Chart
export const SpendingByCategoryChart = ({ data, currency = "USD" }) => {
  const { darkMode } = useTheme();
  const theme = darkMode
    ? { background: "#1a1a1a", text: "#ffffff", card: "#2a2a2a" }
    : { background: "#ffffff", text: "#000000", card: "#f5f5f5" };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.text }]}>
          No spending data available
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map((item) => item.category),
    data: data.map((item) => item.amount),
  };

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>
        Spending by Category
      </Text>
      <PieChart
        data={data.map((item, index) => ({
          name: item.category,
          population: item.amount,
          color: item.color || `hsl(${index * 60}, 70%, 50%)`,
          legendFontColor: theme.text,
        }))}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

// Enhanced Monthly Spending Trend
export const MonthlySpendingTrend = ({ data, currency = "USD" }) => {
  const { darkMode } = useTheme();
  const theme = darkMode
    ? { background: "#1a1a1a", text: "#ffffff", card: "#2a2a2a" }
    : { background: "#ffffff", text: "#000000", card: "#f5f5f5" };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.text }]}>
          No trend data available
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        data: data.map((item) => item.amount),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#4CAF50",
    },
  };

  return (
    <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>
        Monthly Spending Trend
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

// Enhanced Budget Progress Chart
export const BudgetProgressChart = ({ data, currency = "USD" }) => {
  const { darkMode } = useTheme();
  const { formatCurrency, convertCurrency } = useCurrency();
  const theme = darkMode
    ? { background: "#1a1a1a", text: "#ffffff", card: "#2a2a2a" }
    : { background: "#ffffff", text: "#000000", card: "#f5f5f5" };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.text }]}>
          No budget data available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>
        Budget Progress
      </Text>
      {data.map((item, index) => (
        <View key={index} style={styles.budgetItem}>
          <View style={styles.budgetHeader}>
            <Text style={[styles.budgetCategory, { color: theme.text }]}>
              {item.category}
            </Text>
            <Text style={[styles.budgetAmount, { color: theme.text }]}>
              {formatCurrency(convertCurrency(item.spent))} /{" "}
              {formatCurrency(convertCurrency(item.budget))}
            </Text>
          </View>
          <View
            style={[styles.progressBar, { backgroundColor: theme.background }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((item.spent / item.budget) * 100, 100)}%`,
                  backgroundColor:
                    item.spent > item.budget ? "#f44336" : "#4CAF50",
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.text }]}>
            {((item.spent / item.budget) * 100).toFixed(1)}% used
          </Text>
        </View>
      ))}
    </View>
  );
};

// Enhanced Savings Goals Chart
export const SavingsGoalsChart = ({ data, currency = "USD" }) => {
  const { darkMode } = useTheme();
  const { formatCurrency, convertCurrency } = useCurrency();
  const theme = darkMode
    ? { background: "#1a1a1a", text: "#ffffff", card: "#2a2a2a" }
    : { background: "#ffffff", text: "#000000", card: "#f5f5f5" };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.text }]}>
          No savings goals available
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map((goal) => goal.name),
    data: data.map((goal) => (goal.currentAmount / goal.targetAmount) * 100),
  };

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>
        Savings Goals Progress
      </Text>
      <BarChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        verticalLabelRotation={30}
      />
      {data.map((goal, index) => (
        <View key={index} style={styles.goalItem}>
          <Text style={[styles.goalName, { color: theme.text }]}>
            {goal.name}
          </Text>
          <Text style={[styles.goalProgress, { color: theme.text }]}>
            {formatCurrency(convertCurrency(goal.currentAmount))} /{" "}
            {formatCurrency(convertCurrency(goal.targetAmount))}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Interactive Spending Insights
export const SpendingInsights = ({ data, currency = "USD" }) => {
  const { darkMode } = useTheme();
  const { formatCurrency, convertCurrency } = useCurrency();
  const theme = darkMode
    ? { background: "#1a1a1a", text: "#ffffff", card: "#2a2a2a" }
    : { background: "#ffffff", text: "#000000", card: "#f5f5f5" };

  if (!data || Object.keys(data).length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.text }]}>
          No insights available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>
        Spending Insights
      </Text>

      <View style={styles.insightGrid}>
        <View
          style={[styles.insightCard, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.insightLabel, { color: theme.text }]}>
            Total Spent
          </Text>
          <Text style={[styles.insightValue, { color: "#4CAF50" }]}>
            {formatCurrency(convertCurrency(data.totalSpent || 0))}
          </Text>
        </View>

        <View
          style={[styles.insightCard, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.insightLabel, { color: theme.text }]}>
            Average Daily
          </Text>
          <Text style={[styles.insightValue, { color: "#2196F3" }]}>
            {formatCurrency(convertCurrency(data.averageDaily || 0))}
          </Text>
        </View>

        <View
          style={[styles.insightCard, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.insightLabel, { color: theme.text }]}>
            Top Category
          </Text>
          <Text style={[styles.insightValue, { color: "#FF9800" }]}>
            {data.topCategory || "N/A"}
          </Text>
        </View>

        <View
          style={[styles.insightCard, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.insightLabel, { color: theme.text }]}>
            Savings Rate
          </Text>
          <Text style={[styles.insightValue, { color: "#9C27B0" }]}>
            {data.savingsRate?.toFixed(1) || "0"}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  emptyContainer: {
    marginVertical: 10,
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
  budgetItem: {
    marginVertical: 8,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: "600",
  },
  budgetAmount: {
    fontSize: 12,
    opacity: 0.8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  goalName: {
    fontSize: 12,
    fontWeight: "500",
  },
  goalProgress: {
    fontSize: 12,
    opacity: 0.8,
  },
  insightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  insightCard: {
    width: "48%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  insightLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 5,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

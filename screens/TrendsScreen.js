import React, { useContext } from "react";
import { View, Text, Dimensions, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReceiptContext } from "../context/ReceiptContext";
import { CategoryContext } from "../context/CategoryContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { LineChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

function getMonthYear(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

const TrendsScreen = () => {
  const { receipts } = useContext(ReceiptContext);
  const { categories } = useContext(CategoryContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const accent = "#4CAF50";

  // --- Monthly Spending Data ---
  const monthlyTotals = {};
  receipts.forEach((r) => {
    const key = getMonthYear(r.date);
    monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(r.amount);
  });
  const sortedMonths = Object.keys(monthlyTotals).sort();
  const lineLabels = sortedMonths.map((k) => {
    const [year, month] = k.split("-");
    return (
      new Date(year, month - 1).toLocaleString("default", { month: "short" }) +
      " '" +
      year.slice(-2)
    );
  });
  const lineData = sortedMonths.map((k) => monthlyTotals[k]);

  // --- Category Breakdown for Current Month ---
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
  const categoryTotals = {};
  receipts.forEach((r) => {
    if (getMonthYear(r.date) === currentMonthKey) {
      categoryTotals[r.category] =
        (categoryTotals[r.category] || 0) + Number(r.amount);
    }
  });
  const barLabels = categories;
  const barData = categories.map((cat) => categoryTotals[cat] || 0);
  const totalThisMonth = barData.reduce((sum, v) => sum + v, 0);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: accent }]}>
            Trends & Insights
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Visualize your spending over time
          </Text>
        </View>

        {/* Monthly Spending Line Chart */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: darkMode ? theme.cardBackground : "#fff",
              shadowColor: theme.text,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Monthly Spending
          </Text>
          {lineLabels.length > 0 ? (
            <LineChart
              data={{
                labels: lineLabels,
                datasets: [{ data: lineData }],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: theme.background,
                backgroundGradientFrom: theme.background,
                backgroundGradientTo: theme.background,
                decimalPlaces: 2,
                color: (opacity = 1) => accent,
                labelColor: (opacity = 1) => theme.text,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: accent,
                },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          ) : (
            <Text style={{ color: theme.textSecondary, marginBottom: 16 }}>
              No data yet
            </Text>
          )}
        </View>

        {/* Category Breakdown Bar Chart */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: darkMode ? theme.cardBackground : "#fff",
              shadowColor: theme.text,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Category Breakdown (This Month)
          </Text>
          <Text style={[styles.totalThisMonth, { color: accent }]}>
            Total Spent: ${totalThisMonth.toFixed(2)}
          </Text>
          {barLabels.length > 0 ? (
            <BarChart
              data={{
                labels: barLabels,
                datasets: [{ data: barData }],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: theme.background,
                backgroundGradientFrom: theme.background,
                backgroundGradientTo: theme.background,
                decimalPlaces: 2,
                color: (opacity = 1) => accent,
                labelColor: (opacity = 1) => theme.text,
                style: { borderRadius: 16 },
              }}
              style={{ marginVertical: 8, borderRadius: 16 }}
              fromZero
              showValuesOnTopOfBars
            />
          ) : (
            <Text style={{ color: theme.textSecondary }}>No data yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingTop: 0, // reduced from 8 to 0 for minimal top padding
    paddingBottom: 32,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 18,
    marginTop: 0, // reduced from 8 to 0 for less top padding
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  totalThisMonth: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
});

export default TrendsScreen;

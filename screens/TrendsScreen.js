import React, { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReceiptContext } from "../context/ReceiptContext";
import { CategoryContext } from "../context/CategoryContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius, borderRadius } from "../constants/radius";
import { typography } from "../constants/typography";
import { elevation } from "../constants/shadows";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useCurrency } from "../context/CurrencyContext";

const { width: screenWidth } = Dimensions.get("window");

function getMonthYear(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

const TrendsScreen = () => {
  const { receipts } = useContext(ReceiptContext);
  const { categories } = useContext(CategoryContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { formatCurrency, convertCurrency } = useCurrency();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const monthlyChartAnim = useRef(new Animated.Value(0)).current;
  const categoryChartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(200, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(monthlyChartAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(categoryChartAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // --- Monthly Spending Data ---
  const monthlyTotals = {};
  receipts.forEach((r) => {
    const key = getMonthYear(r.date);
    monthlyTotals[key] = (monthlyTotals[key] || 0) + Math.abs(Number(r.amount));
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
        (categoryTotals[r.category] || 0) + Math.abs(Number(r.amount));
    }
  });

  // Filter out categories with zero spending and sort by amount
  const categoryEntries = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6); // Limit to top 6 categories for better visualization

  const barLabels = categoryEntries.map(([category]) => category);
  const barData = categoryEntries.map(([_, amount]) => amount);
  const totalThisMonth = barData.reduce((sum, v) => sum + v, 0);

  // Calculate spending trend
  const currentMonthSpent = totalThisMonth;
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const prevYear =
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const prevMonthKey = `${prevYear}-${(prevMonth + 1)
    .toString()
    .padStart(2, "0")}`;
  const prevMonthSpent = monthlyTotals[prevMonthKey] || 0;
  const spendingTrend =
    prevMonthSpent > 0
      ? ((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100
      : 0;

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.title, { color: theme.text }]}>
          Trends & Insights
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Visualize your spending patterns over time
        </Text>
      </View>
    </Animated.View>
  );

  const renderMonthlyChart = () => (
    <Animated.View
      style={[
        styles.chartContainer,
        {
          opacity: monthlyChartAnim,
          transform: [
            {
              translateY: monthlyChartAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.chartCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Monthly Spending Trend
          </Text>
          <View style={styles.trendIndicator}>
            <Text
              style={[
                styles.trendText,
                { color: spendingTrend <= 0 ? theme.success : theme.danger },
              ]}
            >
              {spendingTrend <= 0 ? "↓" : "↑"}{" "}
              {Math.abs(Math.round(spendingTrend))}%
            </Text>
            <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>
              vs last month
            </Text>
          </View>
        </View>

        {lineLabels.length > 0 ? (
          <LineChart
            data={{
              labels: lineLabels,
              datasets: [{ data: lineData }],
            }}
            width={screenWidth - 80}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: theme.surface,
              backgroundGradientFrom: theme.surface,
              backgroundGradientTo: theme.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.primary,
              labelColor: (opacity = 1) => theme.textSecondary,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: theme.primary,
                fill: theme.surface,
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: theme.border,
                strokeWidth: 1,
              },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        ) : (
          <View
            style={[
              styles.emptyChart,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <Text
              style={[styles.emptyChartText, { color: theme.textSecondary }]}
            >
              No spending data available
            </Text>
            <Text
              style={[styles.emptyChartSubtext, { color: theme.textMuted }]}
            >
              Add receipts to see your spending trends
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderCategoryChart = () => (
    <Animated.View
      style={[
        styles.chartContainer,
        {
          opacity: categoryChartAnim,
          transform: [
            {
              translateY: categoryChartAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.chartCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Category Breakdown
          </Text>
          <Text style={[styles.totalThisMonth, { color: theme.primary }]}>
            {formatCurrency(convertCurrency(totalThisMonth))}
          </Text>
        </View>

        {barLabels.length > 0 ? (
          <BarChart
            data={{
              labels: barLabels,
              datasets: [{ data: barData }],
            }}
            width={screenWidth - 80}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: theme.surface,
              backgroundGradientFrom: theme.surface,
              backgroundGradientTo: theme.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.secondary,
              labelColor: (opacity = 1) => theme.textSecondary,
              style: { borderRadius: 16 },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: theme.border,
                strokeWidth: 1,
              },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
            fromZero
            showValuesOnTopOfBars
            withInnerLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={false}
            segments={4}
          />
        ) : (
          <View
            style={[
              styles.emptyChart,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <Text
              style={[styles.emptyChartText, { color: theme.textSecondary }]}
            >
              No category data for this month
            </Text>
            <Text
              style={[styles.emptyChartSubtext, { color: theme.textMuted }]}
            >
              Add receipts to see spending by category
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderMonthlyChart()}
        {renderCategoryChart()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screen,
    paddingBottom: 80, // Space for bottom tabs
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.body,
    fontWeight: typography.regular,
    textAlign: "center",
    lineHeight: 20,
  },
  chartContainer: {
    marginBottom: spacing.lg,
  },
  chartCard: {
    borderRadius: radius.large,
    padding: spacing.xl,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    flex: 1,
  },
  totalThisMonth: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
  },
  trendIndicator: {
    alignItems: "flex-end",
  },
  trendText: {
    fontSize: typography.small,
    fontWeight: typography.semibold,
  },
  trendLabel: {
    fontSize: typography.small,
    fontWeight: typography.regular,
  },
  emptyChart: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.medium,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyChartText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  emptyChartSubtext: {
    fontSize: typography.small,
    fontWeight: typography.regular,
    textAlign: "center",
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default TrendsScreen;

import React, { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetContext } from "../context/BudgetContext";
import { ReceiptContext } from "../context/ReceiptContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";
import { PieChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { useCurrency } from "../context/CurrencyContext";

const StatsScreen = () => {
  const { expenses } = useContext(BudgetContext);
  const { receipts } = useContext(ReceiptContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const { formatCurrency, convertCurrency } = useCurrency();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate header
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate content
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Use only receipts as the single source of truth
  const categorySpent = {};
  receipts.forEach((e) => {
    categorySpent[e.category] = (categorySpent[e.category] || 0) + e.amount;
  });

  const totalSpent = receipts.reduce((sum, e) => sum + e.amount, 0);

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

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
        Welcome to your
      </Text>
      <Text style={[styles.appName, { color: theme.text }]}>
        <Text style={styles.zennyAccent}>Statistics</Text>
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Analyze your spending patterns and insights
      </Text>
    </Animated.View>
  );

  const renderTotalSpent = () => (
    <Animated.View
      style={[
        styles.totalContainer,
        {
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.totalCard}>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
          Total Spent
        </Text>
        <Text style={[styles.totalAmount, { color: "#E74C3C" }]}>
          {formatCurrency(convertCurrency(totalSpent))}
        </Text>
      </View>
    </Animated.View>
  );

  const renderChart = () => (
    <Animated.View
      style={[
        styles.chartContainer,
        {
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          Spending by Category
        </Text>
        <PieChart
          data={pieData}
          width={screenWidth - 80}
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
      </View>
    </Animated.View>
  );

  const renderCategoryStats = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        {
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Category Breakdown
      </Text>
      {Object.entries(categorySpent).map(([category, amount]) => (
        <View
          key={category}
          style={[
            styles.statCard,
            {
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
        >
          <View style={styles.statContent}>
            <Text style={[styles.statLabel, { color: theme.text }]}>
              {category}
            </Text>
            <View style={styles.statValues}>
              <Text style={[styles.statAmount, { color: "#E74C3C" }]}>
                {formatCurrency(convertCurrency(amount))}
              </Text>
              <Text
                style={[styles.statPercentage, { color: theme.textSecondary }]}
              >
                {((amount / totalSpent) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      ))}
    </Animated.View>
  );

  const renderInsight = () => (
    <Animated.View
      style={[
        styles.insightContainer,
        {
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {mostSpent.category && (
        <View style={styles.insightCard}>
          <Text style={styles.insightIcon}>💡</Text>
          <Text style={[styles.insightTitle, { color: theme.text }]}>
            Spending Insight
          </Text>
          <Text style={[styles.insightText, { color: theme.textSecondary }]}>
            You spent the most on{" "}
            <Text style={[styles.insightHighlight, { color: "#E74C3C" }]}>
              {mostSpent.category}
            </Text>{" "}
            ({formatCurrency(convertCurrency(mostSpent.amount))}). Consider
            budgeting more carefully in this area!
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const renderExportButton = () => (
    <Animated.View
      style={[
        styles.exportContainer,
        {
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.exportButton,
          {
            backgroundColor: "#4CAF50",
          },
        ]}
        onPress={() => alert("Export as PDF or Email coming soon!")}
        activeOpacity={0.8}
      >
        <Text style={styles.exportButtonText}>📤 Export Report</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTrendsButton = () => (
    <TouchableOpacity
      style={[
        styles.trendsButton,
        { backgroundColor: darkMode ? theme.cardBackground : "#4CAF50" },
      ]}
      onPress={() => navigation.navigate("Trends")}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.trendsButtonText,
          { color: darkMode ? theme.text : "#fff" },
        ]}
      >
        📈 View Trends
      </Text>
    </TouchableOpacity>
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
        {renderTrendsButton()}
        {renderHeader()}

        {totalSpent === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📊</Text>
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
              No data yet
            </Text>
            <Text
              style={[styles.emptyStateText, { color: theme.textSecondary }]}
            >
              Start by adding receipts to see your spending statistics
            </Text>
          </View>
        ) : (
          <>
            {renderTotalSpent()}
            {renderChart()}
            {renderCategoryStats()}
            {renderInsight()}
            {renderExportButton()}
          </>
        )}

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
    paddingHorizontal: spacing.screen,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  zennyAccent: {
    color: "#4CAF50",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
  },
  totalContainer: {
    marginBottom: 24,
  },
  totalCard: {
    borderRadius: radius.large,
    padding: 24,
    alignItems: "center",
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartCard: {
    borderRadius: radius.large,
    padding: 20,
    backgroundColor: "transparent",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    marginLeft: 4,
  },
  statCard: {
    borderRadius: radius.large,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statValues: {
    alignItems: "flex-end",
  },
  statAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  statPercentage: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  insightContainer: {
    marginBottom: 24,
  },
  insightCard: {
    borderRadius: radius.large,
    padding: 20,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  insightIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  insightText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  insightHighlight: {
    fontWeight: "700",
  },
  exportContainer: {
    marginBottom: 24,
  },
  exportButton: {
    paddingVertical: 16,
    borderRadius: radius.medium,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 40,
  },
  trendsButton: {
    marginTop: 60, // Increased top padding
    marginBottom: 18,
    borderRadius: radius.large,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 8,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  trendsButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
});

export default StatsScreen;

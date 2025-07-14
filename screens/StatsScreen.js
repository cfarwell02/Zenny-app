import React, {
  useContext,
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetContext } from "../context/BudgetContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius, borderRadius } from "../constants/radius";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { elevation } from "../constants/shadows";
import { PieChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { useCurrency } from "../context/CurrencyContext";

const { width: screenWidth } = Dimensions.get("window");

const StatsScreen = forwardRef((props, ref) => {
  const { expenses } = useContext(BudgetContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const { formatCurrency, convertCurrency } = useCurrency();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const kpiAnim = useRef(new Animated.Value(0)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  // Counter animations
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedCategories, setAnimatedCategories] = useState(0);
  const [animatedTransactions, setAnimatedTransactions] = useState(0);

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(kpiAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate statistics
  const totalSpent = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const transactionCount = expenses.length;

  // Calculate categories count for diversity insight
  const uniqueCategories = new Set(expenses.map((e) => e.category)).size;

  // Animated counter effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedTotal(Math.round(totalSpent * progress));
      setAnimatedCategories(Math.round(uniqueCategories * progress));
      setAnimatedTransactions(Math.round(transactionCount * progress));

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedTotal(totalSpent);
        setAnimatedCategories(uniqueCategories);
        setAnimatedTransactions(transactionCount);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [totalSpent, uniqueCategories, transactionCount]);

  // Category breakdown
  const categorySpent = {};
  expenses.forEach((e) => {
    categorySpent[e.category] =
      (categorySpent[e.category] || 0) + Math.abs(e.amount);
  });

  const topCategories = Object.entries(categorySpent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Chart data
  const pieData = topCategories.map(([category, amount], index) => ({
    name: category,
    amount,
    color: [
      theme.primary,
      theme.secondary,
      theme.accent,
      theme.success,
      theme.warning,
    ][index % 5],
    legendFontColor: theme.text,
    legendFontSize: 12,
  }));

  // Spending insights
  const mostExpensiveCategory = topCategories[0];
  const leastExpensiveCategory = topCategories[topCategories.length - 1];
  const spendingVariation =
    topCategories.length > 1
      ? (
          ((mostExpensiveCategory?.[1] - leastExpensiveCategory?.[1]) /
            mostExpensiveCategory?.[1]) *
          100
        ).toFixed(1)
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
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
              fontSize: typography.xxxl,
              fontWeight: typography.bold,
            },
          ]}
        >
          Spending Analytics
        </Text>
        <Text style={[styles.subtitle, { color: theme.subtleText }]}>
          Insights and trends from your expenses
        </Text>
      </View>
    </Animated.View>
  );

  const kpiData = [
    {
      id: "spent",
      label: "Total Spent",
      value: formatCurrency(convertCurrency(animatedTotal)),
      color: theme.danger,
    },
    {
      id: "categories",
      label: "Categories",
      value: animatedCategories.toString(),
      color: theme.warning,
    },
    {
      id: "transactions",
      label: "Transactions",
      value: animatedTransactions.toString(),
      color: theme.primary,
    },
  ];

  const renderKPICard = ({ item }) => (
    <View
      style={[
        styles.kpiCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text
        style={[styles.kpiLabel, { color: theme.subtleText }]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      <Text style={[styles.kpiValue, { color: item.color }]} numberOfLines={1}>
        {item.value}
      </Text>
    </View>
  );

  const renderKPIs = () => (
    <Animated.View
      style={[
        styles.kpiSection,
        {
          opacity: kpiAnim,
          transform: [
            {
              translateY: kpiAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <FlatList
        data={kpiData}
        renderItem={renderKPICard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiScrollContent}
        snapToInterval={120}
        decelerationRate="fast"
      />
    </Animated.View>
  );

  const renderChart = () => (
    <Animated.View
      style={[
        styles.chartSection,
        {
          opacity: chartAnim,
          transform: [
            {
              translateY: chartAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Spending Breakdown
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Trends")}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            View Trends
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {topCategories.length > 0 ? (
          <>
            <PieChart
              data={pieData}
              width={screenWidth - 80}
              height={200}
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
            <View style={styles.chartLegend}>
              {topCategories.map(([category, amount], index) => (
                <View key={category} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: pieData[index]?.color },
                    ]}
                  />
                  <Text style={[styles.legendText, { color: theme.text }]}>
                    {category}
                  </Text>
                  <Text
                    style={[styles.legendAmount, { color: theme.subtleText }]}
                  >
                    {formatCurrency(convertCurrency(amount))}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: theme.border },
              ]}
            >
              <Text style={styles.emptyIcon}>📊</Text>
            </View>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No spending data yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.subtleText }]}>
              Add receipts to see your spending breakdown
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderInsights = () => (
    <Animated.View
      style={[
        styles.insightsSection,
        {
          opacity: statsAnim,
          transform: [
            {
              translateY: statsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Spending Insights
      </Text>

      {mostExpensiveCategory ? (
        <View
          style={[
            styles.insightCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.insightHeader}>
            <View
              style={[styles.insightIcon, { backgroundColor: theme.primaryBg }]}
            >
              <Text style={[styles.insightIconText, { color: theme.primary }]}>
                💡
              </Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: theme.text }]}>
                Top Spending Category
              </Text>
              <Text style={[styles.insightValue, { color: theme.danger }]}>
                {mostExpensiveCategory[0]}
              </Text>
              <Text style={[styles.insightAmount, { color: theme.subtleText }]}>
                {formatCurrency(convertCurrency(mostExpensiveCategory[1]))}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {topCategories.length > 1 && (
        <View
          style={[
            styles.insightCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.insightHeader}>
            <View
              style={[styles.insightIcon, { backgroundColor: theme.successBg }]}
            >
              <Text style={[styles.insightIconText, { color: theme.success }]}>
                📈
              </Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: theme.text }]}>
                Spending Variation
              </Text>
              <Text style={[styles.insightValue, { color: theme.warning }]}>
                {spendingVariation}%
              </Text>
              <Text style={[styles.insightAmount, { color: theme.subtleText }]}>
                Difference between highest and lowest categories
              </Text>
            </View>
          </View>
        </View>
      )}

      <View
        style={[
          styles.insightCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.insightHeader}>
          <View
            style={[
              styles.insightIcon,
              { backgroundColor: theme.accentBg || theme.primaryBg },
            ]}
          >
            <Text style={[styles.insightIconText, { color: theme.accent }]}>
              🎯
            </Text>
          </View>
          <View style={styles.insightContent}>
            <Text style={[styles.insightTitle, { color: theme.text }]}>
              Spending Efficiency
            </Text>
            <Text style={[styles.insightValue, { color: theme.success }]}>
              {transactionCount > 0 ? "Active" : "No Data"}
            </Text>
            <Text style={[styles.insightAmount, { color: theme.subtleText }]}>
              {transactionCount} transactions tracked
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const scrollViewRef = useRef();
  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    },
  }));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderKPIs()}
        {renderChart()}
        {renderInsights()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
});

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
    fontSize: typography.display,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.base,
    fontWeight: typography.normal,
    textAlign: "center",
    lineHeight: typography.relaxed * typography.base,
  },
  kpiSection: {
    marginBottom: spacing.xl,
  },
  kpiScrollContent: {
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  kpiCard: {
    width: 120,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 90,
    marginRight: spacing.sm,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  kpiLabel: {
    fontSize: typography.xs,
    fontWeight: typography.normal,
    marginBottom: spacing.xs,
    textAlign: "center",
    flexShrink: 1,
    numberOfLines: 1,
  },
  kpiValue: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    textAlign: "center",
    flexShrink: 1,
    numberOfLines: 1,
  },
  chartSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
  },
  viewAllText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  chartCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chartLegend: {
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  legendText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    flex: 1,
  },
  legendAmount: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    textAlign: "center",
  },
  insightsSection: {
    marginBottom: spacing.xl,
  },
  insightCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  insightIconText: {
    fontSize: 20,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    marginBottom: spacing.xs,
  },
  insightValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  insightAmount: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
  },
  exportSection: {
    marginBottom: spacing.xl,
  },
  exportButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: "center",
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  exportButtonText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default StatsScreen;

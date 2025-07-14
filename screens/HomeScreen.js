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
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { spacing } from "../constants/spacing";
import { radius, borderRadius } from "../constants/radius";
import { typography } from "../constants/typography";
import { elevation } from "../constants/shadows";
import { lightTheme, darkTheme } from "../constants/themes";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReceiptContext } from "../context/ReceiptContext";
import { IncomeContext } from "../context/IncomeContext";
import { BudgetContext } from "../context/BudgetContext";
import { NotificationContext } from "../context/NotificationContext";
import { useCurrency } from "../context/CurrencyContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const HomeScreen = forwardRef((props, ref) => {
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { formatCurrency, convertCurrency } = useCurrency();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const kpiAnim = useRef(new Animated.Value(0)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;

  // Counter animations for numbers
  const [animatedSpent, setAnimatedSpent] = useState(0);
  const [animatedIncome, setAnimatedIncome] = useState(0);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [animatedSavings, setAnimatedSavings] = useState(0);

  const { receipts } = useContext(ReceiptContext);
  const { incomeList } = useContext(IncomeContext);
  const { categoryBudgets } = useContext(BudgetContext);
  const { notificationsEnabled } = useContext(NotificationContext);

  const scrollViewRef = useRef();
  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    },
  }));

  // Helper: get current month/year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysLeft = daysInMonth - currentDay;

  // Filter receipts and income for current month
  const monthReceipts = receipts.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthIncome = incomeList.filter((i) => {
    const d = new Date(i.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Calculate totals
  const totalSpent = monthReceipts.reduce(
    (sum, r) => sum + Math.abs(r.amount),
    0
  );
  const totalIncome = monthIncome.reduce(
    (sum, i) => sum + Math.abs(i.amount),
    0
  );
  const balance = totalIncome - totalSpent;
  const savingsRate =
    totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  // Calculate budget progress
  const totalBudget = Object.values(categoryBudgets).reduce((sum, budget) => {
    // Handle both object format {amount: number} and direct number format
    const amount =
      typeof budget === "object" ? budget.amount || 0 : budget || 0;
    return sum + amount;
  }, 0);
  const budgetUsed = totalSpent;
  const budgetRemaining = totalBudget - budgetUsed;
  const budgetProgress = totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0;

  // Get spending trend (compare to previous month)
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthReceipts = receipts.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });
  const prevMonthSpent = prevMonthReceipts.reduce(
    (sum, r) => sum + Math.abs(r.amount),
    0
  );
  const spendingTrend =
    prevMonthSpent > 0
      ? ((totalSpent - prevMonthSpent) / prevMonthSpent) * 100
      : 0;

  // Combine and sort for recent activity
  const recentActivity = [
    ...monthReceipts.map((r) => ({
      type: "receipt",
      id: r.id,
      name: r.tag || r.category,
      amount: -Math.abs(r.amount),
      category: r.category,
      date: r.date,
    })),
    ...monthIncome.map((i) => ({
      type: "income",
      id: i.id,
      name: i.source,
      amount: Math.abs(i.amount),
      category: i.type || "Income",
      date: i.date,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Helper: assign a unique color to each category using Zenny theme
  const categoryColorMap = {};
  const categoryPalette = [
    theme.primary,
    theme.secondary,
    theme.accent,
    theme.success,
    theme.warning,
    theme.danger,
  ];

  function getCategoryColor(category, idx = 0) {
    if (!categoryColorMap[category]) {
      categoryColorMap[category] =
        categoryPalette[idx % categoryPalette.length];
    }
    return categoryColorMap[category];
  }

  // Aggregate top spending by category
  const categorySpent = {};
  monthReceipts.forEach((r) => {
    if (!categorySpent[r.category]) categorySpent[r.category] = 0;
    categorySpent[r.category] += Math.abs(r.amount);
  });
  const topSpending = Object.entries(categorySpent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, amount], idx) => ({
      category,
      amount,
      percent: totalSpent ? Math.round((amount / totalSpent) * 100) : 0,
      color: getCategoryColor(category, idx),
    }));

  // Animated counter effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedSpent(Math.round(totalSpent * progress));
      setAnimatedIncome(Math.round(totalIncome * progress));
      setAnimatedBalance(Math.round(balance * progress));
      setAnimatedSavings(Math.round(savingsRate * progress));

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedSpent(totalSpent);
        setAnimatedIncome(totalIncome);
        setAnimatedBalance(balance);
        setAnimatedSavings(savingsRate);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [totalSpent, totalIncome, balance, savingsRate]);

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
      Animated.timing(activityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDateString = () => {
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

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
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.dateText, { color: theme.subtleText }]}>
            {getDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.settingsButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          onPress={() => props.navigation.navigate("Settings")}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderMainKPI = () => (
    <Animated.View
      style={[
        styles.mainKPISection,
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
      <View
        style={[
          styles.mainKPICard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.mainKPIHeader}>
          <Text style={[styles.mainKPILabel, { color: theme.subtleText }]}>
            Monthly Balance
          </Text>
          <View
            style={[
              styles.mainKPIIndicator,
              {
                backgroundColor: balance >= 0 ? theme.success : theme.danger,
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.mainKPIValue,
            {
              color: balance >= 0 ? theme.success : theme.danger,
            },
          ]}
        >
          {formatCurrency(convertCurrency(animatedBalance))}
        </Text>
        <View style={styles.mainKPIMeta}>
          <Text style={[styles.mainKPIPeriod, { color: theme.subtleText }]}>
            {daysLeft} days left this month
          </Text>
          <View style={styles.trendContainer}>
            <Text
              style={[
                styles.trendText,
                {
                  color: spendingTrend <= 0 ? theme.success : theme.danger,
                },
              ]}
            >
              {spendingTrend <= 0 ? "↓" : "↑"}{" "}
              {Math.abs(Math.round(spendingTrend))}%
            </Text>
            <Text style={[styles.trendLabel, { color: theme.subtleText }]}>
              vs last month
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderQuickStats = () => (
    <Animated.View
      style={[
        styles.quickStatsSection,
        {
          opacity: kpiAnim,
          transform: [
            {
              translateY: kpiAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.quickStatsGrid}>
        <View
          style={[
            styles.quickStatCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.quickStatLabel, { color: theme.subtleText }]}>
            Income
          </Text>
          <Text
            style={[styles.quickStatValue, { color: theme.success }]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
          >
            {formatCurrency(convertCurrency(animatedIncome))}
          </Text>
        </View>

        <View
          style={[
            styles.quickStatCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.quickStatLabel, { color: theme.subtleText }]}>
            Spent
          </Text>
          <Text
            style={[styles.quickStatValue, { color: theme.danger }]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
          >
            {formatCurrency(convertCurrency(animatedSpent))}
          </Text>
        </View>

        <View
          style={[
            styles.quickStatCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.quickStatLabel, { color: theme.subtleText }]}>
            Savings Rate
          </Text>
          <Text
            style={[styles.quickStatValue, { color: theme.primary }]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
          >
            {animatedSavings}%
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderBudgetProgress = () => (
    <Animated.View
      style={[
        styles.budgetSection,
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
      <View
        style={[
          styles.budgetCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.budgetHeader}>
          <Text style={[styles.budgetTitle, { color: theme.text }]}>
            Budget Progress
          </Text>
          {totalBudget > 0 ? (
            <Text style={[styles.budgetAmount, { color: theme.primary }]}>
              {formatCurrency(convertCurrency(budgetRemaining))} remaining
            </Text>
          ) : (
            <Text style={[styles.budgetAmount, { color: theme.primary }]}>
              No budgets set
            </Text>
          )}
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[styles.progressTrack, { backgroundColor: theme.border }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(budgetProgress, 100)}%`,
                  backgroundColor:
                    budgetProgress > 80
                      ? theme.danger
                      : budgetProgress > 60
                      ? theme.warning
                      : theme.success,
                },
              ]}
            />
          </View>
        </View>

        {totalBudget > 0 ? (
          <View style={styles.budgetMeta}>
            <Text style={[styles.budgetUsed, { color: theme.subtleText }]}>
              {formatCurrency(convertCurrency(budgetUsed))} of{" "}
              {formatCurrency(convertCurrency(totalBudget))}
            </Text>
            <Text style={[styles.budgetPercentage, { color: theme.text }]}>
              {Math.round(budgetProgress)}%
            </Text>
          </View>
        ) : (
          <View style={styles.budgetMeta}>
            <Text style={[styles.budgetUsed, { color: theme.subtleText }]}>
              {formatCurrency(convertCurrency(budgetUsed))} spent this month
            </Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate("Budget")}
            >
              <Text style={[styles.budgetPercentage, { color: theme.primary }]}>
                Set Budget
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderSpendingBreakdown = () => (
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
          Top Spending
        </Text>
        <TouchableOpacity
          onPress={() => props.navigation.navigate("Analytics")}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {topSpending.length > 0 ? (
          topSpending.map((item, index) => (
            <View key={index} style={styles.chartItem}>
              <View style={styles.chartLeft}>
                <View
                  style={[styles.chartDot, { backgroundColor: item.color }]}
                />
                <View style={styles.chartInfo}>
                  <Text style={[styles.chartName, { color: theme.text }]}>
                    {item.category}
                  </Text>
                  <Text
                    style={[styles.chartAmount, { color: theme.subtleText }]}
                  >
                    {formatCurrency(convertCurrency(item.amount))}
                  </Text>
                </View>
              </View>
              <View style={styles.chartRight}>
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${item.percent}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.chartPercentage, { color: theme.text }]}>
                  {item.percent}%
                </Text>
              </View>
            </View>
          ))
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
              Add your first receipt to see spending breakdown
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderRecentActivity = () => (
    <Animated.View
      style={[
        styles.activitySection,
        {
          opacity: activityAnim,
          transform: [
            {
              translateY: activityAnim.interpolate({
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
          Recent Activity
        </Text>
        <TouchableOpacity onPress={() => props.navigation.navigate("Receipts")}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.activityCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {recentActivity.length > 0 ? (
          recentActivity.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.activityItem,
                { borderBottomColor: theme.border },
                index === recentActivity.length - 1 && styles.lastActivityItem,
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  {
                    backgroundColor:
                      item.type === "income" ? theme.successBg : theme.dangerBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.activityIconText,
                    {
                      color:
                        item.type === "income" ? theme.success : theme.danger,
                    },
                  ]}
                >
                  {item.type === "income" ? "💰" : "🛒"}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityName, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.activityMeta, { color: theme.subtleText }]}
                >
                  {item.category} • {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.activityAmount,
                  {
                    color:
                      item.type === "income" ? theme.success : theme.danger,
                  },
                ]}
              >
                {item.type === "income" ? "+" : "-"}
                {formatCurrency(convertCurrency(Math.abs(item.amount)))}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: theme.border },
              ]}
            >
              <Text style={styles.emptyIcon}>📝</Text>
            </View>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No recent activity
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.subtleText }]}>
              Add receipts or income to see your activity
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
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderMainKPI()}
        {renderQuickStats()}
        {renderBudgetProgress()}
        {renderSpendingBreakdown()}
        {renderRecentActivity()}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.base,
    fontWeight: typography.normal,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
  settingsIcon: {
    fontSize: 20,
  },
  mainKPISection: {
    marginBottom: spacing.xl,
  },
  mainKPICard: {
    borderRadius: borderRadius.card,
    padding: spacing.xl,
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
  mainKPIHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  mainKPILabel: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  mainKPIIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mainKPIValue: {
    fontSize: 32,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
  },
  mainKPIMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainKPIPeriod: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
  },
  trendContainer: {
    alignItems: "flex-end",
  },
  trendText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  trendLabel: {
    fontSize: typography.xs,
    fontWeight: typography.normal,
  },
  quickStatsSection: {
    marginBottom: spacing.xl,
  },
  quickStatsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: "center",
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
  quickStatLabel: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    marginBottom: spacing.xs,
  },
  quickStatValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    textAlign: "center",
    flexShrink: 1,
    numberOfLines: 1,
  },
  budgetSection: {
    marginBottom: spacing.xl,
  },
  budgetCard: {
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
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  budgetTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
  },
  budgetAmount: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  progressContainer: {
    flex: 1,
    maxWidth: 100,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  budgetMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  budgetUsed: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
  },
  budgetPercentage: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  chartSection: {
    marginBottom: spacing.xl,
  },
  activitySection: {
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
  chartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  chartLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  chartInfo: {
    flex: 1,
  },
  chartName: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  chartAmount: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
  },
  chartRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  chartPercentage: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    minWidth: 40,
    textAlign: "right",
  },
  activityCard: {
    borderRadius: borderRadius.card,
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
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  activityMeta: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
  },
  activityAmount: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default HomeScreen;

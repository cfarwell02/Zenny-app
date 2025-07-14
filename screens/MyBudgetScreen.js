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
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BudgetContext } from "../context/BudgetContext";
import { ReceiptContext } from "../context/ReceiptContext";
import { CategoryContext } from "../context/CategoryContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius, borderRadius } from "../constants/radius";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { elevation } from "../constants/shadows";
import { useCurrency } from "../context/CurrencyContext";
import { useNavigation } from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get("window");

const MyBudgetScreen = forwardRef((props, ref) => {
  const { categoryBudgets, expenses } = useContext(BudgetContext);
  const { receipts } = useContext(ReceiptContext);
  const { categories } = useContext(CategoryContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { formatCurrency, convertCurrency } = useCurrency();
  const navigation = useNavigation();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  // Counter animations
  const [animatedTotalBudget, setAnimatedTotalBudget] = useState(0);
  const [animatedTotalSpent, setAnimatedTotalSpent] = useState(0);
  const [animatedTotalRemaining, setAnimatedTotalRemaining] = useState(0);

  // Use only receipts as the single source of truth
  const categorySpent = {};
  receipts.forEach((e) => {
    categorySpent[e.category] =
      (categorySpent[e.category] || 0) + Math.abs(e.amount);
  });

  const allRelevantCategories = [
    ...new Set([
      ...categories,
      ...Object.keys(categoryBudgets),
      ...Object.keys(categorySpent),
    ]),
  ].filter(Boolean);

  // Calculate totals
  const totalBudget = Object.values(categoryBudgets).reduce((sum, budget) => {
    const amount =
      typeof budget === "object" ? budget.amount || 0 : budget || 0;
    return sum + amount;
  }, 0);

  const totalSpent = Object.values(categorySpent).reduce(
    (sum, spent) => sum + spent,
    0
  );
  const totalRemaining = totalBudget - totalSpent;

  // Animated counter effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedTotalBudget(Math.round(totalBudget * progress));
      setAnimatedTotalSpent(Math.round(totalSpent * progress));
      setAnimatedTotalRemaining(Math.round(totalRemaining * progress));

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedTotalBudget(totalBudget);
        setAnimatedTotalSpent(totalSpent);
        setAnimatedTotalRemaining(totalRemaining);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [totalBudget, totalSpent, totalRemaining]);

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(summaryAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getProgressColor = (spent, budget) => {
    if (budget === 0) return theme.textMuted;
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return theme.danger;
    if (percentage >= 70) return theme.warning;
    return theme.success;
  };

  const getProgressPercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
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
          My Budgets
        </Text>
        <Text style={[styles.subtitle, { color: theme.subtleText }]}>
          Manage your spending limits and track progress
        </Text>
      </View>
    </Animated.View>
  );

  const renderBudgetSummary = () => (
    <Animated.View
      style={[
        styles.summarySection,
        {
          opacity: summaryAnim,
          transform: [
            {
              translateY: summaryAnim.interpolate({
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
          styles.summaryCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.summaryHeader}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>
            Monthly Budget Summary
          </Text>
          <View
            style={[
              styles.summaryStatus,
              {
                backgroundColor:
                  totalRemaining >= 0 ? theme.successBg : theme.dangerBg,
              },
            ]}
          >
            <Text
              style={[
                styles.summaryStatusText,
                { color: totalRemaining >= 0 ? theme.success : theme.danger },
              ]}
            >
              {totalRemaining >= 0 ? "On Track" : "Over Budget"}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
              Total Budget
            </Text>
            <Text style={[styles.summaryValue, { color: theme.primary }]}>
              {formatCurrency(convertCurrency(animatedTotalBudget))}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
              Spent
            </Text>
            <Text style={[styles.summaryValue, { color: theme.danger }]}>
              {formatCurrency(convertCurrency(animatedTotalSpent))}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
              Remaining
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    animatedTotalRemaining >= 0 ? theme.success : theme.danger,
                },
              ]}
            >
              {formatCurrency(convertCurrency(animatedTotalRemaining))}
            </Text>
          </View>
        </View>

        {totalBudget > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.subtleText }]}>
                Overall Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: theme.text }]}>
                {Math.round((totalSpent / totalBudget) * 100)}%
              </Text>
            </View>
            <View
              style={[styles.progressBar, { backgroundColor: theme.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      (totalSpent / totalBudget) * 100,
                      100
                    )}%`,
                    backgroundColor:
                      totalRemaining >= 0 ? theme.success : theme.danger,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderBudgetCard = (category, index) => {
    const budgetObj =
      categoryBudgets[category] && typeof categoryBudgets[category] === "object"
        ? categoryBudgets[category]
        : { amount: 0, threshold: 80, notified: false };
    const budget = budgetObj.amount;
    const spent = categorySpent[category] || 0;
    const remaining = budget - spent;
    const progressColor = getProgressColor(spent, budget);
    const progressPercentage = getProgressPercentage(spent, budget);

    return (
      <Animated.View
        key={category}
        style={[
          styles.budgetCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            opacity: cardsAnim,
            transform: [
              {
                translateY: cardsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>
              {category}
            </Text>
            {budget > 0 && (
              <Text
                style={[styles.categorySubtitle, { color: theme.subtleText }]}
              >
                {progressPercentage.toFixed(0)}% used
              </Text>
            )}
          </View>
          {budget > 0 && (
            <View
              style={[styles.statusBadge, { backgroundColor: progressColor }]}
            >
              <Text style={[styles.statusText, { color: theme.textInverse }]}>
                {remaining >= 0 ? "✓" : "⚠"}
              </Text>
            </View>
          )}
        </View>

        {budget === 0 ? (
          <View style={styles.noBudgetContainer}>
            <View
              style={[
                styles.noBudgetIcon,
                { backgroundColor: theme.primaryBg },
              ]}
            >
              <Text style={[styles.noBudgetIconText, { color: theme.primary }]}>
                💰
              </Text>
            </View>
            <View style={styles.noBudgetContent}>
              <Text style={[styles.noBudgetText, { color: theme.text }]}>
                No budget set
              </Text>
              <Text
                style={[styles.noBudgetSubtext, { color: theme.subtleText }]}
              >
                Spent: {formatCurrency(convertCurrency(spent))}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.setBudgetButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={() => navigation.navigate("Manage Budgets")}
            >
              <Text
                style={[
                  styles.setBudgetButtonText,
                  { color: theme.textInverse },
                ]}
              >
                Set Budget
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.amountContainer}>
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: theme.subtleText }]}>
                  Budget
                </Text>
                <Text style={[styles.amountValue, { color: theme.text }]}>
                  {formatCurrency(convertCurrency(budget))}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: theme.subtleText }]}>
                  Spent
                </Text>
                <Text style={[styles.amountValue, { color: progressColor }]}>
                  {formatCurrency(convertCurrency(spent))}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: theme.subtleText }]}>
                  Remaining
                </Text>
                <Text
                  style={[
                    styles.amountValue,
                    {
                      color: remaining >= 0 ? theme.success : theme.danger,
                    },
                  ]}
                >
                  {formatCurrency(convertCurrency(remaining))}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { backgroundColor: theme.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>
            </View>
          </>
        )}
      </Animated.View>
    );
  };

  const renderQuickActions = () => (
    <Animated.View
      style={[
        styles.actionsSection,
        {
          opacity: summaryAnim,
          transform: [
            {
              translateY: summaryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[
            styles.actionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => navigation.navigate("Manage Categories")}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.accentBg || theme.primaryBg },
            ]}
          >
            <Text style={[styles.actionIconText, { color: theme.accent }]}>
              🏷️
            </Text>
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() => navigation.navigate("Manage Budgets")}
          activeOpacity={0.8}
        >
          <View
            style={[styles.actionIcon, { backgroundColor: theme.secondaryBg }]}
          >
            <Text style={[styles.actionIconText, { color: theme.secondary }]}>
              💰
            </Text>
          </View>
          <Text style={[styles.actionText, { color: theme.text }]}>
            Set Budgets
          </Text>
        </TouchableOpacity>
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
        {renderBudgetSummary()}
        {renderQuickActions()}

        {/* Budget Cards */}
        <Animated.View
          style={[
            styles.budgetSection,
            {
              opacity: cardsAnim,
              transform: [
                {
                  translateY: cardsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Category Budgets
          </Text>

          {allRelevantCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: theme.border },
                ]}
              >
                <Text style={styles.emptyIcon}>💰</Text>
              </View>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No budgets set yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.subtleText }]}>
                Start by setting up your first budget category
              </Text>
            </View>
          ) : (
            allRelevantCategories.map((category, index) =>
              renderBudgetCard(category, index)
            )
          )}
        </Animated.View>

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
  summarySection: {
    marginBottom: spacing.xl,
  },
  summaryCard: {
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
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
  },
  summaryStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.button,
  },
  summaryStatusText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    textAlign: "center",
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  progressPercentage: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.input,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: borderRadius.input,
  },
  actionsSection: {
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionCard: {
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
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    textAlign: "center",
  },
  budgetSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    marginBottom: spacing.lg,
  },
  budgetCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
  },
  categorySubtitle: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    marginTop: spacing.xs,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: typography.bold,
  },
  noBudgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  noBudgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  noBudgetIconText: {
    fontSize: 20,
  },
  noBudgetContent: {
    flex: 1,
  },
  noBudgetText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  noBudgetSubtext: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
  },
  setBudgetButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.button,
  },
  setBudgetButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  amountContainer: {
    marginBottom: spacing.lg,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  amountLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  amountValue: {
    fontSize: typography.base,
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
    marginBottom: spacing.lg,
  },
  emptyActionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
  },
  emptyActionText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default MyBudgetScreen;

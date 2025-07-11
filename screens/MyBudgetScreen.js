import React, { useContext, useRef, useEffect } from "react";
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
import { CategoryContext } from "../context/CategoryContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";

const { width: screenWidth } = Dimensions.get("window");

const MyBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, expenses } = useContext(BudgetContext);
  const { categories } = useContext(CategoryContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnims = useRef([]).current;

  const categorySpent = {};
  expenses.forEach((e) => {
    categorySpent[e.category] = (categorySpent[e.category] || 0) + e.amount;
  });

  const allRelevantCategories = [
    ...new Set([
      ...categories.filter(
        (cat) =>
          categoryBudgets.hasOwnProperty(cat) ||
          categorySpent.hasOwnProperty(cat)
      ),
      ...Object.keys(categoryBudgets).filter((cat) => categories.includes(cat)),
      ...Object.keys(categorySpent).filter((cat) => categories.includes(cat)),
    ]),
  ];

  // Initialize card animations
  useEffect(() => {
    cardAnims.length = allRelevantCategories.length;
    for (let i = 0; i < allRelevantCategories.length; i++) {
      if (!cardAnims[i]) {
        cardAnims[i] = new Animated.Value(0);
      }
    }
  }, [allRelevantCategories.length]);

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

    // Animate cards with stagger
    const cardAnimations = cardAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, cardAnimations).start();
  }, [allRelevantCategories.length]);

  const getProgressColor = (spent, budget) => {
    if (budget === 0) return "#95A5A6";
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return "#E74C3C";
    if (percentage >= 70) return "#F39C12";
    return "#4CAF50";
  };

  const getProgressPercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const renderBudgetCard = (category, index) => {
    const budget = categoryBudgets[category] || 0;
    const spent = categorySpent[category] || 0;
    const remaining = budget - spent;
    const progressColor = getProgressColor(spent, budget);
    const progressPercentage = getProgressPercentage(spent, budget);

    return (
      <Animated.View
        key={category}
        style={[
          {
            opacity: cardAnims[index] || 0,
            transform: [
              {
                translateY:
                  cardAnims[index]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }) || 0,
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.budgetCard,
            {
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>
              {category}
            </Text>
            {budget > 0 && (
              <View
                style={[styles.statusBadge, { backgroundColor: progressColor }]}
              >
                <Text style={styles.statusText}>
                  {progressPercentage.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>

          {budget === 0 ? (
            <View style={styles.noBudgetContainer}>
              <Text
                style={[styles.noBudgetText, { color: theme.textSecondary }]}
              >
                No budget set yet
              </Text>
              <Text style={[styles.spentAmount, { color: theme.text }]}>
                Spent: ${spent.toFixed(2)}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.amountContainer}>
                <View style={styles.amountRow}>
                  <Text
                    style={[styles.amountLabel, { color: theme.textSecondary }]}
                  >
                    Budget
                  </Text>
                  <Text style={[styles.amountValue, { color: theme.text }]}>
                    ${budget.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.amountRow}>
                  <Text
                    style={[styles.amountLabel, { color: theme.textSecondary }]}
                  >
                    Spent
                  </Text>
                  <Text style={[styles.amountValue, { color: progressColor }]}>
                    ${spent.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.amountRow}>
                  <Text
                    style={[styles.amountLabel, { color: theme.textSecondary }]}
                  >
                    Remaining
                  </Text>
                  <Text
                    style={[
                      styles.amountValue,
                      { color: remaining >= 0 ? "#4CAF50" : "#E74C3C" },
                    ]}
                  >
                    ${remaining.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.border },
                  ]}
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
        </View>
      </Animated.View>
    );
  };

  const renderActionButtons = () => {
    const actions = [
      {
        label: "Manage Categories",
        screen: "Manage Categories",
        icon: "🏷️",
        color: "#4ECDC4",
      },
      {
        label: "Manage Budgets",
        screen: "Manage Budgets",
        icon: "💰",
        color: "#45B7D1",
      },
    ];

    return (
      <View style={styles.actionButtonsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.screen}
            style={[
              styles.actionButton,
              {
                backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                shadowColor: theme.text,
              },
            ]}
            onPress={() => navigation.navigate(action.screen)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: action.color },
              ]}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>
              {action.label}
            </Text>
            <Text style={[styles.chevron, { color: theme.textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            💰 My Budgets
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Track your spending and stay on budget
          </Text>
        </Animated.View>

        {/* Budget Cards */}
        <View style={styles.budgetContainer}>
          {allRelevantCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📊</Text>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No budgets yet
              </Text>
              <Text
                style={[styles.emptyStateText, { color: theme.textSecondary }]}
              >
                Start by adding a receipt or setting up your first budget
              </Text>
            </View>
          ) : (
            allRelevantCategories.map((category, index) =>
              renderBudgetCard(category, index)
            )
          )}
        </View>

        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Bottom Spacing */}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  budgetContainer: {
    marginBottom: 32,
  },
  budgetCard: {
    borderRadius: radius.large,
    padding: 20,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  noBudgetContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  noBudgetText: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 8,
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  actionButtonsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: radius.medium,
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
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  chevron: {
    fontSize: 20,
    fontWeight: "300",
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
});

export default MyBudgetScreen;

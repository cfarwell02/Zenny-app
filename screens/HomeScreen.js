import React, { useContext, useRef, useEffect } from "react";
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
import { darkMode } from "../context/ThemeContext";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { lightTheme, darkTheme } from "../constants/themes";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReceiptContext } from "../context/ReceiptContext";
import { IncomeContext } from "../context/IncomeContext";
import * as Notifications from "expo-notifications";
import { BudgetContext } from "../context/BudgetContext";
import { NotificationContext } from "../context/NotificationContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  // Animation values
  const NUM_ANIM_SECTIONS = 8; // 1 balance card + 6 menu cards + 1 quick actions
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(
    [...Array(6)].map(() => new Animated.Value(0))
  ).current;

  const { receipts } = useContext(ReceiptContext);
  const { incomeList } = useContext(IncomeContext);
  const { checkAndNotifyThreshold } = useContext(BudgetContext);
  const { notificationsEnabled } = useContext(NotificationContext);

  // Helper: get current month/year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter receipts and income for current month
  const monthReceipts = receipts.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthIncome = incomeList.filter((i) => {
    const d = new Date(i.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

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
    .slice(0, 3);

  // Helper: assign a unique color to each category
  const categoryColorMap = {};
  const palette = [
    "#4CAF50",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#F39C12",
    "#8E44AD",
    "#E74C3C",
    "#2196F3",
    "#F59E0B",
    "#10B981",
  ];
  function getCategoryColor(category, idx = 0) {
    if (!categoryColorMap[category]) {
      categoryColorMap[category] = palette[idx % palette.length];
    }
    return categoryColorMap[category];
  }

  // Aggregate top spending by category (current month, top 3)
  const categorySpent = {};
  monthReceipts.forEach((r) => {
    if (!categorySpent[r.category]) categorySpent[r.category] = 0;
    categorySpent[r.category] += Math.abs(r.amount);
  });
  const totalSpent = Object.values(categorySpent).reduce((a, b) => a + b, 0);
  const topSpending = Object.entries(categorySpent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount], idx) => ({
      category,
      amount,
      percent: totalSpent ? Math.round((amount / totalSpent) * 100) : 0,
      color: getCategoryColor(category, idx),
    }));

  // Calculate totals
  const totalIncome = monthIncome.reduce(
    (sum, i) => sum + Math.abs(i.amount),
    0
  );

  // Format as currency
  const formatCurrency = (amount) =>
    `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  useEffect(() => {
    // Animate header
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animate cards with stagger
    const cardAnimations = cardAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      })
    );

    Animated.stagger(200, cardAnimations).start();
  }, []);

  useEffect(() => {
    // Check thresholds for all categories
    if (!notificationsEnabled) return;
    Object.entries(categorySpent).forEach(([category, spent]) => {
      const triggered = checkAndNotifyThreshold(category, spent);
      if (triggered) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Budget Alert",
            body: `You have exceeded your threshold for ${category}!`,
          },
          trigger: null,
        });
      }
    });
  }, [receipts, notificationsEnabled]);

  const menuItems = [
    {
      label: "Receipts",
      screen: "Saved Receipts",
      icon: "📄",
      description: "View your saved receipts",
      color: "#6366f1",
    },
    {
      label: "Add Receipt",
      screen: "Add Receipt",
      icon: "➕",
      description: "Scan and save new receipts",
      color: "#10b981",
    },
    {
      label: "My Budget",
      screen: "My Budget",
      icon: "💰",
      description: "Track your spending limits",
      color: "#f59e0b",
    },
    {
      label: "Statistics",
      screen: "Statistics",
      description: "View spending analytics",
      icon: "📊",
      color: "#ef4444",
    },
    {
      label: "Income",
      screen: "Income",
      icon: "💼",
      description: "Manage your income sources",
      color: "#8b5cf6",
    },
    {
      label: "Savings",
      screen: "SavingsGoal",
      icon: "🎯",
      description: "Set and track savings goals",
      color: "#06b6d4",
    },
  ];

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: 0,
            },
          ],
        },
      ]}
    >
      <View style={styles.headerTop}>
        <Text style={[styles.appName, { color: theme.text }]}>Zenny</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      <Text
        style={[
          styles.headerSubtitle,
          { color: darkMode ? "#fff" : theme.textSecondary },
        ]}
      >
        Your personal finance dashboard
      </Text>
    </Animated.View>
  );

  const renderBalanceCard = () => (
    <Animated.View
      style={[
        styles.balanceCard,
        {
          backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
          opacity: cardAnims[0],
          transform: [
            {
              scale: 1,
            },
          ],
        },
      ]}
    >
      <View style={styles.balanceStats}>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              { color: darkMode ? "#fff" : theme.textSecondary },
            ]}
          >
            This Month
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              { color: darkMode ? "#fff" : theme.textSecondary },
            ]}
          >
            Income
          </Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
      </View>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: "#4CAF50" }]}
          onPress={() => navigation.navigate("Add Receipt")}
        >
          <Text style={styles.quickActionIcon}>📷</Text>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            Add Receipt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: "#2196F3" }]}
          onPress={() => navigation.navigate("Income")}
        >
          <Text style={styles.quickActionIcon}>💰</Text>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            Add Income
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderRecentActivity = () => (
    <Animated.View
      style={[
        styles.activityCard,
        {
          backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
          opacity: cardAnims[1],
          transform: [
            {
              translateY: 0,
            },
          ],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Recent Activity
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Saved Receipts")}>
          <Text style={[styles.viewAllText, { color: "#4CAF50" }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      {recentActivity.length === 0 ? (
        <Text
          style={{
            color: theme.textSecondary,
            textAlign: "center",
            marginVertical: 16,
          }}
        >
          No activity yet this month.
        </Text>
      ) : (
        recentActivity.map((transaction, index) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View
                style={[
                  styles.categoryIcon,
                  {
                    backgroundColor:
                      transaction.amount > 0 ? "#4CAF50" : "#FF6B6B",
                  },
                ]}
              >
                <Text style={styles.categoryIconText}>
                  {transaction.amount > 0 ? "💰" : "💳"}
                </Text>
              </View>
              <View style={styles.transactionInfo}>
                <Text
                  style={styles.transactionName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {transaction.name}
                </Text>
                <Text
                  style={styles.transactionCategory}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {transaction.category} •{" "}
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text
              style={styles.transactionAmount}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {transaction.amount > 0 ? "+" : ""}$
              {Math.abs(transaction.amount).toFixed(2)}
            </Text>
          </View>
        ))
      )}
    </Animated.View>
  );

  const renderSpendingInsights = () => (
    <View
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Top Spending
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Statistics")}>
          <Text style={[styles.viewAllText, { color: "#4CAF50" }]}>
            Details
          </Text>
        </TouchableOpacity>
      </View>
      {topSpending.length === 0 ? (
        <Text
          style={{
            color: theme.textSecondary,
            textAlign: "center",
            marginVertical: 16,
          }}
        >
          No spending yet this month.
        </Text>
      ) : (
        topSpending.map((cat, index) => (
          <View key={cat.category} style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <View
                style={[styles.categoryDot, { backgroundColor: cat.color }]}
              />
              <View style={styles.categoryInfo}>
                <Text
                  style={[
                    styles.categoryName,
                    darkMode ? { color: "#fff" } : {},
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cat.category}
                </Text>
                <Text
                  style={[
                    styles.categoryAmount,
                    darkMode ? { color: "#fff" } : {},
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  ${cat.amount.toFixed(2)}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.categoryPercentage, { color: theme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {cat.percent}%
            </Text>
          </View>
        ))
      )}
    </View>
  );

  const renderMenuGrid = () => (
    <View style={styles.menuSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Manage Your Finances
      </Text>
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.screen}
            style={[
              styles.menuItem,
              {
                opacity: cardAnims[index + 1],
                transform: [
                  {
                    translateY: 0,
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.menuCard,
                {
                  backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                  shadowColor: theme.text,
                },
              ]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <Text
                style={[styles.menuLabel, { color: theme.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.label}
              </Text>
              <Text
                style={[styles.menuDescription, { color: theme.textSecondary }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.description}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <Animated.View
      style={[
        styles.quickActionsSection,
        {
          opacity: cardAnims[7],
          transform: [
            {
              translateY: 0,
            },
          ],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Quick Actions
      </Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            {
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
          onPress={() => navigation.navigate("Add Receipt")}
        >
          <Text style={styles.quickActionIcon}>📷</Text>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            Scan Receipt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            {
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
          onPress={() => navigation.navigate("My Budget")}
        >
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={[styles.quickActionText, { color: theme.text }]}>
            View Budget
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderMinimalRecentActivity = () => (
    <View
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        // Remove shadow for a flat look
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18, color: theme.text }}>
          Recent Activity
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Saved Receipts")}>
          <Text style={{ color: "#4CAF50", fontWeight: "600", fontSize: 14 }}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      {recentActivity.length === 0 ? (
        <Text
          style={{
            color: theme.textSecondary,
            textAlign: "center",
            marginVertical: 16,
          }}
        >
          No activity yet this month.
        </Text>
      ) : (
        recentActivity.map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: darkMode ? "#000" : theme.border || "#eee",
            }}
          >
            <View style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 16,
                  color: darkMode ? "#fff" : theme.text,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
              <Text
                style={{
                  color: darkMode ? "#fff" : theme.textSecondary,
                  fontSize: 12,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.category} • {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Text
              style={{
                width: 70,
                textAlign: "right",
                fontWeight: "bold",
                fontSize: 16,
                flexShrink: 0,
                color: item.amount > 0 ? "#2ecc71" : "#e74c3c",
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.amount > 0 ? "+" : ""}${Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { alignItems: "stretch" },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderBalanceCard()}
        {renderMinimalRecentActivity()}
        {renderSpendingInsights()}
        {renderMenuGrid()}
        {renderQuickActions()}
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
    paddingVertical: 24,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
  },
  headerBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
  },
  balanceCard: {
    padding: 20,
    borderRadius: radius.large,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  balanceStats: { flexDirection: "row", marginBottom: 20 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: "700" },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: radius.medium,
    alignItems: "center",
    marginHorizontal: 4,
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
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    marginBottom: 16,
  },
  menuCard: {
    padding: 16,
    borderRadius: radius.medium,
    alignItems: "center",
    height: 140, // fixed height for uniformity
    justifyContent: "center",
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
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconText: {
    fontSize: 24,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 16,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: radius.medium,
    alignItems: "center",
    marginHorizontal: 4,
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
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomSpacing: {
    height: 40,
  },
  activityCard: {
    padding: 20,
    borderRadius: radius.large,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryIconText: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionCategory: {
    fontSize: 12,
    fontWeight: "400",
    color: "#888",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    width: 70,
    textAlign: "right",
    flexShrink: 0,
  },
  insightsCard: {
    padding: 20,
    borderRadius: radius.large,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? "#000" : "#E5E7EB",
    paddingHorizontal: 16, // Add horizontal padding
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    paddingRight: 16, // Reserve space for percentage
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: "400",
    width: 50,
    textAlign: "right",
    flexShrink: 0,
    position: "absolute", // Try absolute positioning
    right: 0,
  },
  categoryInfo: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    marginRight: 8, // Add some margin
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "400",
    color: "#888",
  },
});

export default HomeScreen;

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
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { lightTheme, darkTheme } from "../constants/themes";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(
    [...Array(6)].map(() => new Animated.Value(0))
  ).current;

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
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.headerTop}>
        <Text style={[styles.appName, { color: theme.text }]}>Zenny</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.badgeText}>v1.0</Text>
        </View>
      </View>
      <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
        Your personal finance dashboard
      </Text>
    </Animated.View>
  );

  const renderDashboardCard = () => (
    <Animated.View
      style={[
        styles.dashboardCard,
        {
          backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
          opacity: cardAnims[0],
          transform: [
            {
              scale: cardAnims[0].interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.dashboardHeader}>
        <Text style={[styles.dashboardTitle, { color: theme.text }]}>
          Quick Overview
        </Text>
        <View style={styles.dashboardStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#10b981" }]}>$2,450</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              This Month
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#f59e0b" }]}>$1,200</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Budget Left
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
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
                    translateY: cardAnims[index + 1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
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
              <Text style={[styles.menuLabel, { color: theme.text }]}>
                {item.label}
              </Text>
              <Text
                style={[styles.menuDescription, { color: theme.textSecondary }]}
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
          opacity: cardAnims[5],
          transform: [
            {
              translateY: cardAnims[5].interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
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
        {renderDashboardCard()}
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
  dashboardCard: {
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
  dashboardHeader: {
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  dashboardStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
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
});

export default HomeScreen;

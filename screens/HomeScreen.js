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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonAnims = useRef(
    [...Array(7)].map(() => new Animated.Value(0))
  ).current;

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

    // Animate buttons with stagger
    const buttonAnimations = buttonAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, buttonAnimations).start();
  }, []);

  const menuItems = [
    {
      label: "View Receipts",
      screen: "Saved Receipts",
      icon: "🧾",
      color: "#FF6B6B",
      gradient: ["#FF6B6B", "#FF8E8E"],
    },
    {
      label: "Add Receipt",
      screen: "Add Receipt",
      icon: "➕",
      color: "#4ECDC4",
      gradient: ["#4ECDC4", "#6EE7DF"],
    },
    {
      label: "Budgets",
      screen: "My Budget",
      icon: "💰",
      color: "#45B7D1",
      gradient: ["#45B7D1", "#6BC5E0"],
    },
    {
      label: "Statistics",
      screen: "Statistics",
      icon: "📊",
      color: "#F39C12",
      gradient: ["#F39C12", "#F7B932"],
    },
    {
      label: "Income Tracker",
      screen: "Income",
      icon: "💼",
      color: "#8E44AD",
      gradient: ["#8E44AD", "#A569BD"],
    },
    {
      label: "Savings Goal",
      screen: "SavingsGoal",
      icon: "🎯",
      color: "#E74C3C",
      gradient: ["#E74C3C", "#EC7063"],
    },
    {
      label: "Settings",
      screen: "Settings",
      icon: "⚙️",
      color: "#95A5A6",
      gradient: ["#95A5A6", "#B2BABB"],
    },
  ];

  const renderQuickActions = () => {
    const quickActions = menuItems.slice(0, 4);
    return (
      <View style={styles.quickActionsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((item, index) => (
            <Animated.View
              key={item.screen}
              style={[
                styles.quickActionWrapper,
                {
                  opacity: buttonAnims[index],
                  transform: [
                    {
                      translateY: buttonAnims[index].interpolate({
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
                  styles.quickActionButton,
                  {
                    backgroundColor: darkMode
                      ? theme.cardBackground
                      : "#FFFFFF",
                    shadowColor: theme.text,
                  },
                ]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Text style={styles.quickActionIcon}>{item.icon}</Text>
                </View>
                <Text style={[styles.quickActionText, { color: theme.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  const renderMainActions = () => {
    const mainActions = menuItems.slice(4);
    return (
      <View style={styles.mainActionsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          More Options
        </Text>
        {mainActions.map((item, index) => (
          <Animated.View
            key={item.screen}
            style={[
              {
                opacity: buttonAnims[index + 4],
                transform: [
                  {
                    translateY: buttonAnims[index + 4].interpolate({
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
                styles.mainActionButton,
                {
                  backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                  shadowColor: theme.text,
                },
              ]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.mainActionIconContainer,
                  { backgroundColor: item.color },
                ]}
              >
                <Text style={styles.mainActionIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.mainActionText, { color: theme.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.chevron, { color: theme.textSecondary }]}>
                ›
              </Text>
            </TouchableOpacity>
          </Animated.View>
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
          <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
            Welcome back to
          </Text>
          <Text style={[styles.appName, { color: theme.text }]}>
            <Text style={styles.zennyAccent}>Zenny</Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage your finances with ease
          </Text>
        </Animated.View>

        {/* Quick Actions Grid */}
        {renderQuickActions()}

        {/* Main Actions List */}
        {renderMainActions()}

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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    marginLeft: 4,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  quickActionButton: {
    padding: 20,
    borderRadius: radius.large,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  mainActionsContainer: {
    marginBottom: 24,
  },
  mainActionButton: {
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
  mainActionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  mainActionIcon: {
    fontSize: 20,
  },
  mainActionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  chevron: {
    fontSize: 20,
    fontWeight: "300",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default HomeScreen;

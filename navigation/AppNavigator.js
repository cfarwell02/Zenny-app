import React, { useEffect, useState, useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import auth from "@react-native-firebase/auth";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import AddReceiptScreen from "../screens/AddReceiptScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SavedReceiptsScreen from "../screens/SavedReceipts";
import MyBudgetScreen from "../screens/MyBudgetScreen";
import ManageBudgetScreen from "../screens/ManageBudgetsScreen";
import AuthScreen from "../screens/AuthScreen";
import ManageCategoriesScreen from "../screens/ManageCategoriesScreen";
import IncomeScreen from "../screens/IncomeScreen";
import SavingsGoalScreen from "../screens/SavingsGoalScreen";
import TrendsScreen from "../screens/TrendsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Zenny Brand Color Theme
const ZENNY_THEME = {
  primary: "#6366F1",
  secondary: "#8B5CF6",
  accent: "#06B6D4",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",
  border: "#E5E7EB",
  shadow: "rgba(99, 102, 241, 0.08)",
};

// Main Tab Navigator
const MainTabNavigator = () => {
  const homeRef = useRef();
  const receiptsRef = useRef();
  const analyticsRef = useRef();
  const budgetRef = useRef();
  const settingsRef = useRef();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Add") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Receipts") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "Budget") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: ZENNY_THEME.primary,
        tabBarInactiveTintColor: ZENNY_THEME.textMuted,
        tabBarStyle: {
          backgroundColor: ZENNY_THEME.surface,
          borderTopColor: ZENNY_THEME.border,
          borderTopWidth: 1,
          paddingBottom: 15,
          paddingTop: 10,
          height: 85,
          shadowColor: ZENNY_THEME.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 12,
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        options={{ tabBarLabel: "Home" }}
        listeners={{
          tabPress: () => {
            if (homeRef.current && homeRef.current.scrollToTop) {
              homeRef.current.scrollToTop();
            }
          },
        }}
      >
        {(props) => (
          <HomeScreen {...props} ref={homeRef} navigation={props.navigation} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Add"
        component={AddReceiptScreen}
        options={{ tabBarLabel: "Add" }}
      />
      <Tab.Screen
        name="Receipts"
        options={{ tabBarLabel: "Receipts" }}
        listeners={{
          tabPress: () => {
            if (receiptsRef.current && receiptsRef.current.scrollToTop) {
              receiptsRef.current.scrollToTop();
            }
          },
        }}
      >
        {(props) => (
          <SavedReceiptsScreen
            {...props}
            ref={receiptsRef}
            navigation={props.navigation}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Analytics"
        options={{ tabBarLabel: "Analytics" }}
        listeners={{
          tabPress: () => {
            if (analyticsRef.current && analyticsRef.current.scrollToTop) {
              analyticsRef.current.scrollToTop();
            }
          },
        }}
      >
        {(props) => (
          <StatsScreen
            {...props}
            ref={analyticsRef}
            navigation={props.navigation}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Budget"
        options={{ tabBarLabel: "Budget" }}
        listeners={{
          tabPress: () => {
            if (budgetRef.current && budgetRef.current.scrollToTop) {
              budgetRef.current.scrollToTop();
            }
          },
        }}
      >
        {(props) => (
          <MyBudgetScreen
            {...props}
            ref={budgetRef}
            navigation={props.navigation}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{ tabBarLabel: "Settings" }}
        listeners={{
          tabPress: () => {
            if (settingsRef.current && settingsRef.current.scrollToTop) {
              settingsRef.current.scrollToTop();
            }
          },
        }}
      >
        {(props) => (
          <SettingsScreen
            {...props}
            ref={settingsRef}
            navigation={props.navigation}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      console.log(
        "🔥 Auth state changed:",
        firebaseUser ? "User logged in" : "User logged out"
      );
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handler for successful authentication
  const handleAuthSuccess = () => {
    console.log("✅ Auth success handler called");
    // The auth state change will be handled by the useEffect above
    // No need to do anything here as the user state will update automatically
  };

  if (loading) {
    return null; // Optionally show a splash screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="Manage Budgets" component={ManageBudgetScreen} />
          <Stack.Screen
            name="Manage Categories"
            component={ManageCategoriesScreen}
          />
          <Stack.Screen name="Income" component={IncomeScreen} />
          <Stack.Screen name="SavingsGoal" component={SavingsGoalScreen} />
          <Stack.Screen
            name="Trends"
            component={TrendsScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth">
          {(props) => (
            <AuthScreen {...props} onAuthSuccess={handleAuthSuccess} />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

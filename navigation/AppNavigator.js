import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import { TouchableOpacity, Text } from "react-native";

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

const Stack = createNativeStackNavigator();

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
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="Saved Receipts" component={SavedReceiptsScreen} />
          <Stack.Screen name="Add Receipt" component={AddReceiptScreen} />
          <Stack.Screen name="My Budget" component={MyBudgetScreen} />
          <Stack.Screen name="Statistics" component={StatsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Manage Budgets" component={ManageBudgetScreen} />
          <Stack.Screen
            name="Manage Categories"
            component={ManageCategoriesScreen}
          />
          <Stack.Screen name="Income" component={IncomeScreen} />
          <Stack.Screen name="SavingsGoal" component={SavingsGoalScreen} />
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

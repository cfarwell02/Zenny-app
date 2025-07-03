import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import AddReceiptScreen from "../screens/AddReceiptScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SavedReceiptsScreen from "../screens/SavedReceipts";
import MyBudgetScreen from "../screens/MyBudgetScreen";
import ManageBudgetScreen from "../screens/ManageBudgetsScreen";
import AuthScreen from "../screens/AuthScreen";
import ManageCategoriesScreen from "../screens/ManageCategoriesScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
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
    </Stack.Navigator>
  );
};

export default AppNavigator;

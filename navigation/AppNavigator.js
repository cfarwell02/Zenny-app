import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import HomeScreen from "../screens/HomeScreen";
import AddReceiptScreen from "../screens/AddReceiptScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SavedReceiptsScreen from "../screens/SavedReceipts";
import MyBudgetScreen from "../screens/MyBudgetScreen";
import ManageBudgetScreen from "../screens/ManageBudgetsScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Saved Receipts" component={SavedReceiptsScreen} />
        <Stack.Screen name="Add Receipt" component={AddReceiptScreen} />
        <Stack.Screen name="My Budget" component={MyBudgetScreen} />
        <Stack.Screen name="Statistics" component={StatsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Manage Budgets" component={ManageBudgetScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

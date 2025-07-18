import React, { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { LogBox } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { ReceiptProvider } from "./context/ReceiptContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BudgetProvider } from "./context/BudgetContext";
import { NotificationProvider } from "./context/NotificationContext";
import auth from "@react-native-firebase/auth";
import { NavigationContainer } from "@react-navigation/native";
import { CategoryProvider } from "./context/CategoryContext";
import { IncomeProvider } from "./context/IncomeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import AuthScreen from "./screens/AuthScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Onboarding from "./components/Onboarding";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldDismissBanner: false, // Keep notification in panel
  }),
});

function MainApp() {
  const { user, initializing } = useAuth();
  if (initializing) return null; // Or a loading spinner
  return user ? (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  ) : (
    <AuthScreen />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DataProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <CategoryProvider>
                <BudgetProvider>
                  <ReceiptProvider>
                    <IncomeProvider>
                      <AuthProvider>
                        <MainApp />
                      </AuthProvider>
                    </IncomeProvider>
                  </ReceiptProvider>
                </BudgetProvider>
              </CategoryProvider>
            </NotificationProvider>
          </CurrencyProvider>
        </DataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

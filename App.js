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
import AuthScreen from "./screens/AuthScreen";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null; // Optional: replace with splash screen or loading spinner

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
    <NotificationProvider>
      <CategoryProvider>
        <ThemeProvider>
          <BudgetProvider>
            <ReceiptProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </ReceiptProvider>
          </BudgetProvider>
        </ThemeProvider>
      </CategoryProvider>
    </NotificationProvider>
  );
}

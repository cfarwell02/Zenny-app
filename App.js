import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { LogBox } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { ReceiptProvider } from "./context/ReceiptContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BudgetProvider } from "./context/BudgetContext";
import { NotificationProvider } from "./context/NotificationContext";

// 🔴 Global Error Handler for uncaught exceptions
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log("🔴 Global Error:", error);
  if (isFatal) {
    console.log("‼️ FATAL ERROR");
  }
});

export default function App() {
  useEffect(() => {
    // Set up the global notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  return (
    <NotificationProvider>
      <ThemeProvider>
        <ReceiptProvider>
          <BudgetProvider>
            <AppNavigator />
          </BudgetProvider>
        </ReceiptProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
}

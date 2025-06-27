import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { LogBox } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { ReceiptProvider } from "./context/ReceiptContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BudgetProvider } from "./context/BudgetContext";
import {
  NotificationContext,
  NotificationProvider,
} from "./context/NotificationContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
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

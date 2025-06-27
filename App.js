import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { LogBox } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { ReceiptProvider } from "./context/ReceiptContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BudgetProvider } from "./context/BudgetContext";

export default function App() {
  return (
    <ThemeProvider>
      <ReceiptProvider>
        <BudgetProvider>
          <AppNavigator />
        </BudgetProvider>
      </ReceiptProvider>
    </ThemeProvider>
  );
}

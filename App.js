import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";

import AppNavigator from "./navigation/AppNavigator";
import { ReceiptProvider } from "./context/ReceiptContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BudgetProvider } from "./context/BudgetContext"; // ✅ Add this

export default function App() {
  useEffect(() => {
    Notifications.requestPermissionsAsync(); // permission request on app open
  }, []);

  return (
    <ThemeProvider>
      <ReceiptProvider>
        <BudgetProvider>
          {" "}
          {/* ✅ Wrap everything inside here */}
          <AppNavigator />
        </BudgetProvider>
      </ReceiptProvider>
    </ThemeProvider>
  );
}

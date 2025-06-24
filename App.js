import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { ReceiptProvider } from "./context/ReceiptContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <ReceiptProvider>
        <AppNavigator />
      </ReceiptProvider>
    </ThemeProvider>
  );
}

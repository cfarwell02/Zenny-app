import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { ReceiptProvider } from "./context/ReceiptContext";

export default function App() {
  return (
    <ReceiptProvider>
      <AppNavigator />
    </ReceiptProvider>
  );
}

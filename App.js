import React, { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { LogBox } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { ReceiptProvider } from "./context/ReceiptContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BudgetProvider } from "./context/BudgetContext";
import { NotificationProvider } from "./context/NotificationContext";
import { supabase } from "./supabase";
import AuthScreen from "./screens/AuthScreen"; // create this file
import { NavigationContainer } from "@react-navigation/native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <NotificationProvider>
      <ThemeProvider>
        <ReceiptProvider>
          <BudgetProvider>
            <NavigationContainer>
              {session ? (
                <AppNavigator />
              ) : (
                <AuthScreen
                  onAuthSuccess={() =>
                    supabase.auth
                      .getSession()
                      .then(({ data }) => setSession(data.session))
                  }
                />
              )}
            </NavigationContainer>
          </BudgetProvider>
        </ReceiptProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
}

import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext";
import { useCurrency } from "../context/CurrencyContext";
import { ReceiptContext } from "../context/ReceiptContext";
import { IncomeContext } from "../context/IncomeContext";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext";
import { DataContext } from "../context/DataContext";
import {
  exportDataAsCSV,
  exportDataAsJSON,
  getExportOptions,
} from "../utils/exportData";
import {
  lightHaptic,
  mediumHaptic,
  heavyHaptic,
  hapticPatterns,
} from "../utils/hapticFeedback";
import auth from "@react-native-firebase/auth";

const SettingsScreen = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { notificationsEnabled, setNotificationsEnabled } =
    useContext(NotificationContext);
  const {
    selectedCurrency,
    updateCurrency,
    getCurrencyOptions,
    SUPPORTED_CURRENCIES,
  } = useCurrency();
  const { receipts, clearReceipts } = useContext(ReceiptContext);
  const { incomeList, clearIncomes } = useContext(IncomeContext);
  const { categoryBudgets, setCategoryBudgets, clearBudgets } =
    useContext(BudgetContext);
  const { categories, clearCategories } = useContext(CategoryContext);
  const { userData, clearUserData } = useContext(DataContext);
  const [isExporting, setIsExporting] = useState(false);

  const theme = darkMode ? darkTheme : lightTheme;

  const handleToggleNotifications = async (value) => {
    lightHaptic(); // Haptic feedback for toggle
    if (Platform.OS === "web") return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Enable notifications in settings to receive reminders."
        );
        return;
      }
    }

    setNotificationsEnabled(value);
  };

  const handleClearData = async () => {
    heavyHaptic(); // Heavy haptic for destructive action
    Alert.alert(
      "Clear All Data?",
      "This will delete all your receipts, incomes, budgets, and categories. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          onPress: async () => {
            try {
              // Clear all data from contexts
              if (clearReceipts) await clearReceipts();
              if (clearIncomes) await clearIncomes();
              if (clearBudgets) await clearBudgets();
              if (clearCategories) await clearCategories();
              if (clearUserData) await clearUserData();

              // Reset budgets state
              setCategoryBudgets({});

              Alert.alert(
                "Data Cleared",
                "All your financial data has been successfully cleared."
              );
            } catch (error) {
              console.error("Error clearing data:", error);
              hapticPatterns.errorOccurred(); // Error haptic
              Alert.alert(
                "Error",
                "Failed to clear some data. Please try again."
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      Alert.alert("Signed Out", "You have been logged out.");
    } catch (error) {
      Alert.alert("Sign Out Failed", error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Error", "No user is currently signed in.");
      return;
    }

    try {
      await user.delete();
      Alert.alert("Account deleted", "Your account has been removed.");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Re-authentication Required",
          "Please sign in again to delete your account."
        );
      } else {
        Alert.alert("Delete Failed", error.message);
      }
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete Account?",
      "Are you sure you want to permanently delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: handleDeleteAccount, style: "destructive" },
      ]
    );
  };

  const handleExportData = async () => {
    lightHaptic(); // Light haptic for button press
    if (!userData || Object.keys(userData).length === 0) {
      hapticPatterns.errorOccurred(); // Error haptic for no data
      Alert.alert("No Data", "There's no data to export.");
      return;
    }

    const exportOptions = getExportOptions();
    Alert.alert("Export Data", "Choose export format:", [
      ...exportOptions.map((option) => ({
        text: option.label,
        onPress: () => performExport(option.value),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const performExport = async (format) => {
    setIsExporting(true);
    try {
      let result;
      if (format === "csv") {
        result = await exportDataAsCSV(userData, selectedCurrency);
      } else if (format === "json") {
        result = await exportDataAsJSON(userData, selectedCurrency);
      }

      if (result.success) {
        hapticPatterns.dataExported(); // Success haptic for export
        Alert.alert(
          "Export Successful",
          `Your data has been exported as ${result.fileName}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      hapticPatterns.errorOccurred(); // Error haptic
      Alert.alert("Export Failed", "Failed to export data. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.header, { color: theme.text }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Preferences
          </Text>

          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                lightHaptic();
                toggleDarkMode();
              }}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>
              Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
            />
          </View>

          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Currency</Text>
            <TouchableOpacity
              style={[
                styles.currencyPicker,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={() => {
                Alert.alert(
                  "Select Currency",
                  "Choose your preferred currency",
                  [
                    ...getCurrencyOptions().map((option) => ({
                      text: option.label,
                      onPress: () => updateCurrency(option.value),
                    })),
                    { text: "Cancel", style: "cancel" },
                  ]
                );
              }}
            >
              <Text style={[styles.currencyText, { color: theme.text }]}>
                {SUPPORTED_CURRENCIES[selectedCurrency]?.symbol}{" "}
                {selectedCurrency}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Data Management
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <View style={styles.exportLoading}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Exporting...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>📊 Export Data</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.danger }]}
            onPress={handleClearData}
          >
            <Text style={styles.buttonText}>🗑️ Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#999" }]}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>🚪 Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#cc0000" }]}
            onPress={confirmDeleteAccount}
          >
            <Text style={styles.buttonText}>⚠️ Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.screen,
    flexGrow: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  label: {
    fontSize: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  currencyPicker: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.small,
    backgroundColor: "#f0f0f0",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  exportLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

export default SettingsScreen;

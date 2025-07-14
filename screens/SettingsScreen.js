import React, {
  useContext,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { typography } from "../constants/typography";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext";
import { useCurrency } from "../context/CurrencyContext";
import { ReceiptContext } from "../context/ReceiptContext";
import { IncomeContext } from "../context/IncomeContext";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext";
import { DataContext } from "../context/DataContext";
import auth from "@react-native-firebase/auth";
import {
  exportDataAsCSV,
  exportDataAsJSON,
  exportDataAsPDF,
} from "../utils/exportData";

const SettingsScreen = forwardRef((props, ref) => {
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
  const { clearUserData } = useContext(DataContext);

  // FAQ State
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const animatedValues = useRef({}).current;

  const theme = darkMode ? darkTheme : lightTheme;

  // FAQ Data
  const faqData = [
    {
      id: 1,
      question: "How do I add a receipt?",
      answer:
        "Tap the 'Add' tab, fill in the details, and save. For subscriptions or recurring expenses, enable the 'Recurring' toggle and set the frequency.",
    },
    {
      id: 2,
      question: "How do I set up a budget?",
      answer:
        "Go to the 'Budgets' tab, tap 'Set Budgets', choose a category, and set your monthly limit and alert threshold.",
    },
    {
      id: 3,
      question: "Can I edit receipts?",
      answer:
        "Yes! In the 'Receipts' tab, tap any receipt to view, edit, or delete it. Recurring receipts are marked with a checkmark.",
    },
    {
      id: 4,
      question: "Is my data secure?",
      answer:
        "All your data is securely stored in the cloud and synced to your account. Only you can access your financial info.",
    },
    {
      id: 5,
      question: "How do I export my data?",
      answer:
        "Go to Settings → Data Management → Export Data to download your receipts, budgets, and categories as CSV, JSON, or PDF.",
    },
  ];

  // FAQ Helper Functions
  const toggleFAQ = (id) => {
    if (!animatedValues[id]) {
      animatedValues[id] = new Animated.Value(0);
    }

    if (expandedFAQ === id) {
      // Close the currently open FAQ
      setExpandedFAQ(null);
      Animated.timing(animatedValues[id], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      // Close the previously open FAQ first, then open the new one
      if (expandedFAQ !== null && animatedValues[expandedFAQ]) {
        Animated.timing(animatedValues[expandedFAQ], {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      setExpandedFAQ(id);
      Animated.timing(animatedValues[id], {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleExportData = async () => {
    if (!receipts || receipts.length === 0) {
      Alert.alert("No Data", "There's no data to export.");
      return;
    }

    const exportOptions = [
      { label: "CSV", value: "csv" },
      { label: "JSON", value: "json" },
      { label: "PDF", value: "pdf" },
    ];

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
      // Simple export logic - you can enhance this based on your needs
      const data = {
        receipts,
        income: incomeList,
        budgets: categoryBudgets,
        categories,
        exportDate: new Date().toISOString(),
        currency: selectedCurrency,
      };

      let result;
      if (format === "csv") {
        result = await exportDataAsCSV(data, selectedCurrency);
      } else if (format === "json") {
        result = await exportDataAsJSON(data, selectedCurrency);
      } else if (format === "pdf") {
        result = await exportDataAsPDF(data, selectedCurrency);
      }

      if (result && result.success) {
        Alert.alert(
          "Export Successful",
          `Your data has been exported as ${result.fileName}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Export Failed", "Failed to export data. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleNotifications = async (value) => {
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

  const scrollViewRef = useRef();
  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    },
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Settings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Preferences
          </Text>

          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
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

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            FAQ
          </Text>

          {faqData.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={[
                  styles.faqQuestion,
                  { backgroundColor: theme.cardBackground },
                ]}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.faqQuestionText, { color: theme.text }]}>
                  {faq.question}
                </Text>
                <Text style={[styles.faqExpandIcon, { color: theme.text }]}>
                  {expandedFAQ === faq.id ? "−" : "+"}
                </Text>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.faqAnswer,
                  {
                    backgroundColor: theme.cardBackground,
                    maxHeight:
                      animatedValues[faq.id]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 200],
                      }) || 0,
                    opacity: animatedValues[faq.id] || 0,
                  },
                ]}
              >
                <Text
                  style={[styles.faqAnswerText, { color: theme.subtleText }]}
                >
                  {faq.answer}
                </Text>
              </Animated.View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: (spacing.screen + spacing.sm) / 2, // halfway between original and reduced
    paddingBottom: 50, // halfway between 60 and 40
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 26, // halfway between 32 and 20
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 25, // halfway between 32 and 18
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10, // halfway between 12 and 8
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10, // halfway between 12 and 8
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  label: {
    fontSize: 16,
  },
  button: {
    marginTop: 13, // halfway between 16 and 10
    paddingVertical: 12, // halfway between 14 and 10
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

  faqItem: {
    marginBottom: 6, // halfway between 8 and 4
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 13, // halfway between 16 and 10
    paddingVertical: 11, // halfway between 14 and 8
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  faqExpandIcon: {
    fontSize: 20,
    fontWeight: "bold",
    width: 20,
    textAlign: "center",
  },
  faqAnswer: {
    paddingHorizontal: 13, // halfway between 16 and 10
    paddingVertical: 10, // halfway between 12 and 8
    marginTop: 3, // halfway between 4 and 2
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SettingsScreen;

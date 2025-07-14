import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius, borderRadius } from "../constants/radius";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { elevation } from "../constants/shadows";
import { useCurrency } from "../context/CurrencyContext";
import { Picker } from "@react-native-picker/picker";

const ManageBudgetScreen = ({ navigation }) => {
  const {
    categoryBudgets,
    updateCategoryBudget,
    setCategoryBudgets,
    cleanupDeletedCategoryBudgets,
  } = useContext(BudgetContext);
  const { categories } = useContext(CategoryContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { formatCurrency } = useCurrency();

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [items, setItems] = useState([]);
  const [newAmount, setNewAmount] = useState("");
  const [threshold, setThreshold] = useState("");

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const updatedItems = categories.map((category) => ({
      label: category,
      value: category,
    }));
    setItems(updatedItems);
  }, [categories]);

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const cat = categoryBudgets[selectedCategory];
      setNewAmount(
        cat && typeof cat === "object"
          ? String(cat.amount ?? "")
          : String(cat ?? "")
      );
      setThreshold(
        cat && typeof cat === "object" ? String(cat.threshold ?? "80") : "80"
      );
    }
  }, [selectedCategory, categoryBudgets]);

  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert("Missing Info", "Please select a category.");
      return;
    }

    if (!newAmount || isNaN(Number(newAmount)) || Number(newAmount) < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid budget amount.");
      return;
    }

    if (
      !threshold ||
      isNaN(Number(threshold)) ||
      Number(threshold) < 1 ||
      Number(threshold) > 100
    ) {
      Alert.alert(
        "Invalid Threshold",
        "Please enter a valid threshold percentage (1-100)."
      );
      return;
    }

    try {
      await updateCategoryBudget(
        selectedCategory,
        Number(newAmount),
        Number(threshold)
      );

      Alert.alert(
        "Saved",
        `Updated budget for ${selectedCategory}: ${formatCurrency(
          Number(newAmount)
        )} (Threshold: ${threshold}%)`
      );

      setSelectedCategory("");
      setNewAmount("");
      setThreshold("");
    } catch (error) {
      console.error("Error saving budget:", error);
      Alert.alert("Error", "Failed to save budget. Please try again.");
    }
  };

  const handleRemoveBudget = async () => {
    if (!selectedCategory) return;
    try {
      await cleanupDeletedCategoryBudgets(selectedCategory);
      Alert.alert("Removed", `Budget removed for ${selectedCategory}.`);
      setSelectedCategory("");
      setNewAmount("");
      setThreshold("");
    } catch (error) {
      console.log("Remove budget error:", error);
      Alert.alert("Error", "Failed to remove budget. Please try again.");
    }
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.title, { color: theme.text }]}>Set Budgets</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Configure spending limits for your categories
        </Text>
      </View>
    </Animated.View>
  );

  const renderForm = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: formAnim,
          transform: [
            {
              translateY: formAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.formCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Budget Configuration
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Category
          </Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                height: 60, // Increased height for better touch area
                justifyContent: "center",
              },
            ]}
          >
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={[{ color: theme.text, height: 54 }]} // Increased height
            >
              <Picker.Item label="Choose a category..." value="" />
              {categories.map((category) => (
                <Picker.Item key={category} label={category} value={category} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Monthly Budget
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="numeric"
            placeholder="Enter budget amount"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Alert Threshold (%)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={threshold}
            onChangeText={setThreshold}
            keyboardType="numeric"
            placeholder="Enter threshold percentage"
            placeholderTextColor={theme.textMuted}
            maxLength={3}
          />
        </View>

        {selectedCategory && (
          <View
            style={[
              styles.currentBudgetContainer,
              { backgroundColor: theme.successBg },
            ]}
          >
            <Text style={[styles.currentBudgetText, { color: theme.success }]}>
              Current budget for {selectedCategory}:{" "}
              {formatCurrency(
                categoryBudgets[selectedCategory]
                  ? typeof categoryBudgets[selectedCategory] === "object"
                    ? categoryBudgets[selectedCategory].amount ?? 0
                    : Number(categoryBudgets[selectedCategory])
                  : 0
              )}
            </Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveButtonText, { color: theme.textInverse }]}>
              Save Budget
            </Text>
          </TouchableOpacity>

          {selectedCategory && categoryBudgets[selectedCategory] && (
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.danger }]}
              onPress={handleRemoveBudget}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.removeButtonText, { color: theme.textInverse }]}
              >
                Remove Budget
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderForm()}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screen,
    paddingBottom: 80, // Space for bottom tabs
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerContent: {
    alignItems: "center",
  },

  title: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.body,
    fontWeight: typography.regular,
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  formCard: {
    borderRadius: radius.large,
    padding: spacing.xl,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: radius.medium,
    overflow: "hidden",
    height: 60, // Increased height
    justifyContent: "center", // Center Picker vertically
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.medium,
    fontSize: typography.body,
    fontWeight: typography.medium,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  currentBudgetContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.medium,
  },
  currentBudgetText: {
    fontSize: typography.small,
    fontWeight: typography.medium,
    textAlign: "center",
  },
  buttonContainer: {
    gap: spacing.md,
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.medium,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
  },
  removeButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.medium,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  removeButtonText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default ManageBudgetScreen;

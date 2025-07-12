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
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const updatedItems = categories.map((category) => ({
      label: category,
      value: category,
    }));
    setItems(updatedItems);
  }, [categories]);

  useEffect(() => {
    // Animate header
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate content
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
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
      // Optionally, update threshold if needed (not handled by updateCategoryBudget)
      // You may want to extend updateCategoryBudget to handle threshold as well

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
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
        Welcome to
      </Text>
      <Text style={[styles.appName, { color: theme.text }]}>
        <Text style={styles.zennyAccent}>Budgets</Text>
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Set and manage your spending limits
      </Text>
    </Animated.View>
  );

  const renderForm = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.formCard}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Set Budget
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Select Category
          </Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          >
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={[{ color: theme.text, height: 50 }]}
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
            Budget Amount ($)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                borderColor: theme.textSecondary + "30",
                color: theme.text,
                shadowColor: theme.text,
              },
            ]}
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="numeric"
            placeholder="Enter budget amount"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Threshold (%)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                borderColor: theme.textSecondary + "30",
                color: theme.text,
                shadowColor: theme.text,
              },
            ]}
            value={threshold}
            onChangeText={setThreshold}
            keyboardType="numeric"
            placeholder="Enter threshold percent"
            placeholderTextColor={theme.textSecondary}
            maxLength={3}
          />
        </View>

        {selectedCategory && (
          <View style={styles.currentBudgetContainer}>
            <Text
              style={[styles.currentBudgetText, { color: theme.textSecondary }]}
            >
              Current budget for {selectedCategory}: $
              {categoryBudgets[selectedCategory]
                ? typeof categoryBudgets[selectedCategory] === "object"
                  ? (categoryBudgets[selectedCategory].amount ?? 0).toFixed(2)
                  : Number(categoryBudgets[selectedCategory]).toFixed(2)
                : "0.00"}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: "#4CAF50",
            },
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>💾 Save Budget</Text>
        </TouchableOpacity>
        {/* Remove Budget Button - only show if a budget is set for the selected category */}
        {selectedCategory && categoryBudgets[selectedCategory] && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveBudget}
            activeOpacity={0.8}
          >
            <Text style={styles.removeButtonText}>Remove Budget</Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: spacing.screen,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  zennyAccent: {
    color: "#4CAF50",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 32,
  },
  formCard: {
    borderRadius: radius.large,
    padding: 24,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
    zIndex: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: radius.medium,
    minHeight: 50,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: radius.medium,
    fontSize: 16,
    fontWeight: "600",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  currentBudgetContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: radius.medium,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  currentBudgetText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: radius.medium,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSpacing: {
    height: 40,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: radius.medium,
    overflow: "hidden",
  },
  removeButton: {
    marginTop: 16,
    backgroundColor: "#E74C3C",
    paddingVertical: 14,
    borderRadius: radius.large,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ManageBudgetScreen;

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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";

const ManageBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, updateCategoryBudget } = useContext(BudgetContext);
  const { categories } = useContext(CategoryContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [items, setItems] = useState([]);
  const [newAmount, setNewAmount] = useState("");

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

  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert("Missing Info", "Please select a category.");
      return;
    }

    if (!newAmount || isNaN(Number(newAmount)) || Number(newAmount) < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid budget amount.");
      return;
    }

    try {
      updateCategoryBudget(selectedCategory, Number(newAmount));

      Alert.alert(
        "Saved",
        `Updated budget for ${selectedCategory}: $${newAmount}`
      );

      setSelectedCategory("");
      setNewAmount("");
    } catch (error) {
      console.error("Error saving budget:", error);
      Alert.alert("Error", "Failed to save budget. Please try again.");
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

          <DropDownPicker
            open={open}
            value={selectedCategory}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedCategory}
            setItems={setItems}
            onChangeValue={(value) => {
              setSelectedCategory(value);
              const existingBudget = categoryBudgets[value];
              setNewAmount(existingBudget ? existingBudget.toString() : "");
            }}
            placeholder="Choose a category..."
            style={[
              styles.dropdown,
              {
                backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                borderColor: theme.textSecondary + "30",
                shadowColor: theme.text,
              },
            ]}
            textStyle={{ color: theme.text, fontSize: 16 }}
            placeholderStyle={{ color: theme.textSecondary }}
            dropDownContainerStyle={{
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              borderColor: theme.textSecondary + "30",
              zIndex: 1000,
            }}
            itemSeparator={true}
            itemSeparatorStyle={{ backgroundColor: theme.textSecondary + "20" }}
          />
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

        {selectedCategory && (
          <View style={styles.currentBudgetContainer}>
            <Text
              style={[styles.currentBudgetText, { color: theme.textSecondary }]}
            >
              Current budget for {selectedCategory}: $
              {categoryBudgets[selectedCategory]
                ? categoryBudgets[selectedCategory].toFixed(2)
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
});

export default ManageBudgetScreen;

import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";

const ManageBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, updateCategoryBudget } = useContext(BudgetContext);
  const { categories } = useContext(CategoryContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [items, setItems] = useState([]);
  const [newAmount, setNewAmount] = useState("");

  useEffect(() => {
    const updatedItems = categories.map((category) => ({
      label: category,
      value: category,
    }));
    setItems(updatedItems);
  }, [categories]);

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

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Manage Budgets
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Select Category:
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
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
            textStyle={{ color: theme.text }}
            placeholderStyle={{ color: theme.placeholder }}
            dropDownContainerStyle={{
              backgroundColor: theme.input,
              borderColor: theme.border,
              zIndex: 1000,
            }}
            itemSeparator={true}
            itemSeparatorStyle={{ backgroundColor: theme.border }}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Set Budget Amount ($):
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="numeric"
            placeholder="Enter budget amount"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        {selectedCategory && (
          <Text
            style={[
              styles.currentBudget,
              { color: theme.subtleText || theme.text },
            ]}
          >
            Current budget for {selectedCategory}: $
            {categoryBudgets[selectedCategory]
              ? categoryBudgets[selectedCategory].toFixed(2)
              : "0.00"}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveText, { color: theme.buttonText }]}>
            Save Budget
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.primary }]}>
            ← Back to Budget Overview
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 20,
    zIndex: 10, // Ensures dropdowns render above others
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "500",
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  currentBudget: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 8,
  },
});

export default ManageBudgetScreen;

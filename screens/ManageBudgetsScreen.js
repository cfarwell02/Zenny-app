import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext"; // Add this import
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";

const ManageBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, updateCategoryBudget } = useContext(BudgetContext); // Use setBudget instead of updateCategoryBudget
  const { categories } = useContext(CategoryContext); // Use CategoryContext for dropdown options
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Use categories from CategoryContext instead of categoryBudgets keys
    const updatedItems = categories.map((category) => ({
      label: category,
      value: category,
    }));
    setItems(updatedItems);
  }, [categories]); // Watch categories instead of categoryBudgets

  const [newAmount, setNewAmount] = useState("");

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
      // Change this line:
      updateCategoryBudget(selectedCategory, Number(newAmount));

      console.log("Budget Saved for", selectedCategory, ":", newAmount);
      Alert.alert(
        "Saved",
        `Updated budget for ${selectedCategory}: $${newAmount}`
      );

      // Reset form
      setSelectedCategory("");
      setNewAmount("");
    } catch (error) {
      console.error("Error saving budget:", error);
      Alert.alert("Error", "Failed to save budget. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Manage Budgets
        </Text>

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
            console.log("Selected category:", value); // Debug log
            setSelectedCategory(value);
            // Pre-fill the amount field with existing budget if available
            const existingBudget = categoryBudgets[value];
            setNewAmount(existingBudget ? existingBudget.toString() : "");
          }}
          placeholder="Choose a category..."
          style={[
            styles.dropdown,
            { backgroundColor: theme.input, borderColor: theme.border },
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

        <View style={{ marginTop: 20, marginBottom: 16 }}>
          <Button
            title="Save Budget"
            onPress={handleSave}
            color={theme.primary}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.text }]}>
            ← Back to Budget Overview
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    zIndex: 10,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  dropdown: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
  },
  currentBudget: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 10,
  },
  backButton: {
    textAlign: "center",
    fontSize: 16,
  },
});

export default ManageBudgetScreen;

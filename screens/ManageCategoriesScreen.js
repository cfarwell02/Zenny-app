import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lightTheme, darkTheme } from "../constants/themes";
import { ThemeContext } from "../context/ThemeContext";
import { ReceiptContext } from "../context/ReceiptContext";
import { CategoryContext } from "../context/CategoryContext"; // Add this import
import { BudgetContext } from "../context/BudgetContext"; // Add this import
import { radius } from "../constants/radius";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const defaultCategories = ["Food", "Shopping", "Transport", "Bills"];

const ManageCategoriesScreen = () => {
  const [newCategory, setNewCategory] = useState("");

  const { darkMode } = useContext(ThemeContext);
  const { receipts } = useContext(ReceiptContext);
  const { categories } = useContext(CategoryContext); // Use CategoryContext
  const { cleanupDeletedCategoryBudgets } = useContext(BudgetContext); // Add this
  const theme = darkMode ? darkTheme : lightTheme;

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    const alreadyExists = categories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      Alert.alert("Duplicate", "That category already exists.");
      return;
    }

    try {
      const user = auth().currentUser;
      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("categories")
        .doc(trimmed)
        .set({ name: trimmed });

      setNewCategory("");
      // No need to update local state - CategoryContext will handle it via Firestore listener
    } catch (err) {
      console.error("Error saving category:", err);
      Alert.alert("Error", "Failed to save category. Please try again.");
    }
  };

  const handleDeleteCategory = async (category) => {
    const isCategoryUsed = receipts.some(
      (r) => r.category.toLowerCase() === category.toLowerCase()
    );

    if (isCategoryUsed) {
      Alert.alert(
        "Cannot Delete",
        `There are receipts saved under the "${category}" category.`
      );
      return;
    }

    try {
      const user = auth().currentUser;

      // Delete from categories collection
      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("categories")
        .doc(category)
        .delete();

      // Clean up associated budget
      await cleanupDeletedCategoryBudgets(category);

      console.log("Deleted category and associated budget:", category);
      // No need to update local state - CategoryContext will handle it via Firestore listener
    } catch (err) {
      console.error("Error deleting category:", err);
      Alert.alert("Error", "Failed to delete category. Please try again.");
    }
  };

  const renderCategory = ({ item }) => (
    <View style={[styles.categoryRow, { backgroundColor: theme.card }]}>
      <Text style={{ color: theme.text }}>{item}</Text>
      {!defaultCategories.includes(item) && (
        <TouchableOpacity onPress={() => handleDeleteCategory(item)}>
          <Text style={{ color: theme.error }}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Manage Categories
      </Text>

      <TextInput
        placeholder="Add new category"
        placeholderTextColor={theme.placeholder}
        value={newCategory}
        onChangeText={setNewCategory}
        style={[
          styles.input,
          {
            borderColor: theme.border,
            color: theme.text,
            backgroundColor: theme.input,
          },
        ]}
      />

      <TouchableOpacity
        onPress={handleAddCategory}
        style={[styles.button, { backgroundColor: theme.primary }]}
      >
        <Text style={{ color: theme.buttonText, fontWeight: "500" }}>
          ➕ Add Category
        </Text>
      </TouchableOpacity>

      <FlatList
        data={categories} // Use categories from CategoryContext
        keyExtractor={(item) => item}
        renderItem={renderCategory}
        style={{ marginTop: 24 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: radius.medium,
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: radius.medium,
    marginBottom: 10,
  },
});

export default ManageCategoriesScreen;

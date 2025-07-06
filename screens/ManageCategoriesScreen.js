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
import { CategoryContext } from "../context/CategoryContext";
import { BudgetContext } from "../context/BudgetContext";
import { radius } from "../constants/radius";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const defaultCategories = ["Food", "Shopping", "Transport", "Bills"];

const ManageCategoriesScreen = () => {
  const [newCategory, setNewCategory] = useState("");

  const { darkMode } = useContext(ThemeContext);
  const { receipts } = useContext(ReceiptContext);
  const { categories } = useContext(CategoryContext);
  const { cleanupDeletedCategoryBudgets } = useContext(BudgetContext);
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

      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("categories")
        .doc(category)
        .delete();

      await cleanupDeletedCategoryBudgets(category);
    } catch (err) {
      console.error("Error deleting category:", err);
      Alert.alert("Error", "Failed to delete category. Please try again.");
    }
  };

  const renderCategory = ({ item }) => (
    <View style={[styles.categoryRow, { backgroundColor: theme.card }]}>
      <Text style={{ color: theme.text, fontSize: 16 }}>{item}</Text>
      {!defaultCategories.includes(item) && (
        <TouchableOpacity onPress={() => handleDeleteCategory(item)}>
          <Text style={{ color: theme.error, fontSize: 14 }}>Delete</Text>
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

      <View style={styles.inputSection}>
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
          <Text
            style={{ color: theme.buttonText, fontSize: 16, fontWeight: "600" }}
          >
            ➕ Add Category
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={renderCategory}
        contentContainerStyle={{ paddingTop: 10 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.medium,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.medium,
    marginBottom: 12,
  },
});

export default ManageCategoriesScreen;

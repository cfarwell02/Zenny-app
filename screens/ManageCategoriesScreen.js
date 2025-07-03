import React, { useState } from "react";
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
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { ReceiptContext } from "../context/ReceiptContext";
import { radius } from "../constants/radius";

const defaultCategories = ["Food", "Shopping", "Transport", "Bills"];

const ManageCategoriesScreen = () => {
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const { darkMode } = useContext(ThemeContext);
  const { receipts } = useContext(ReceiptContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    const alreadyExists = [...defaultCategories, ...customCategories].some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      Alert.alert("Duplicate", "That category already exists.");
      return;
    }

    setCustomCategories((prev) => [...prev, trimmed]);
    setNewCategory("");
  };

  const handleDeleteCategory = (category) => {
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

    setCustomCategories((prev) => {
      const updated = prev.filter((item) => item !== category);
      console.log("Deleted category:", category);
      return updated;
    });
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

  const allCategories = [...defaultCategories, ...customCategories];

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
        data={allCategories}
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

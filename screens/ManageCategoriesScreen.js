import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lightTheme, darkTheme } from "../constants/themes";
import { ThemeContext } from "../context/ThemeContext";
import { ReceiptContext } from "../context/ReceiptContext";
import { CategoryContext } from "../context/CategoryContext";
import { BudgetContext } from "../context/BudgetContext";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

const defaultCategories = ["Food", "Shopping", "Transport", "Bills"];

const ManageCategoriesScreen = () => {
  const [newCategory, setNewCategory] = useState("");

  const { darkMode } = useContext(ThemeContext);
  const { receipts } = useContext(ReceiptContext);
  const { categories } = useContext(CategoryContext);
  const { cleanupDeletedCategoryBudgets } = useContext(BudgetContext);
  const { categoryBudgets, setCategoryBudgets, updateCategoryBudget } =
    useContext(BudgetContext);
  const theme = darkMode ? darkTheme : lightTheme;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

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

  const handleThresholdChange = (category, value) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: {
        ...(typeof prev[category] === "object"
          ? prev[category]
          : { amount: prev[category] || 0 }),
        threshold: value,
      },
    }));
  };

  const renderCategory = ({ item }) => (
    <View
      style={[
        styles.categoryCard,
        {
          backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
          shadowColor: theme.text,
        },
      ]}
    >
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryText, { color: theme.text }]}>{item}</Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}
        >
          <Text style={{ color: theme.textSecondary, marginRight: 4 }}>
            Threshold %:
          </Text>
          <TextInput
            value={String(
              (categoryBudgets[item] && categoryBudgets[item].threshold) || 80
            )}
            onChangeText={(val) =>
              handleThresholdChange(item, val.replace(/[^0-9]/g, ""))
            }
            keyboardType="numeric"
            style={{
              width: 48,
              height: 32,
              borderWidth: 1,
              borderColor: theme.textSecondary + "30",
              borderRadius: 8,
              color: theme.text,
              backgroundColor: darkMode ? theme.cardBackground : "#fff",
              textAlign: "center",
              marginRight: 8,
            }}
            maxLength={3}
          />
        </View>
        {!defaultCategories.includes(item) && (
          <TouchableOpacity
            onPress={() => handleDeleteCategory(item)}
            style={styles.deleteButton}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
        <Text style={styles.zennyAccent}>Categories</Text>
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Manage your expense categories
      </Text>
    </Animated.View>
  );

  const renderAddSection = () => (
    <Animated.View
      style={[
        styles.addSection,
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
      <TextInput
        placeholder="Add new category..."
        placeholderTextColor={theme.textSecondary}
        value={newCategory}
        onChangeText={setNewCategory}
        style={[
          styles.input,
          {
            borderColor: theme.textSecondary + "30",
            color: theme.text,
            backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
            shadowColor: theme.text,
          },
        ]}
      />

      <TouchableOpacity
        onPress={handleAddCategory}
        style={[
          styles.addButton,
          {
            backgroundColor: "#4CAF50",
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>➕ Add Category</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {categories.length === 0 ? (
        <>
          {renderHeader()}
          {renderAddSection()}
          <View style={styles.categoriesContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Categories
            </Text>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏷️</Text>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No categories yet
              </Text>
              <Text
                style={[styles.emptyStateText, { color: theme.textSecondary }]}
              >
                Add your first category above to get started
              </Text>
            </View>
          </View>
          <View style={styles.bottomSpacing} />
        </>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          renderItem={renderCategory}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderAddSection()}
              <View style={styles.categoriesContainer}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Your Categories
                </Text>
              </View>
            </>
          }
          ListFooterComponent={<View style={styles.bottomSpacing} />}
          contentContainerStyle={styles.categoriesList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  addSection: {
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
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
  addButton: {
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
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    marginLeft: 4,
  },
  categoriesList: {
    paddingBottom: 20,
  },
  categoryCard: {
    borderRadius: radius.large,
    padding: 16,
    marginBottom: 12,
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
  categoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.small,
    backgroundColor: "#FF3B30",
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ManageCategoriesScreen;

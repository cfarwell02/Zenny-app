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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { lightTheme, darkTheme } from "../constants/themes";
import { ThemeContext } from "../context/ThemeContext";
import { ReceiptContext } from "../context/ReceiptContext";
import {
  CategoryContext,
  availableCategories,
} from "../context/CategoryContext";
import { BudgetContext } from "../context/BudgetContext";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";
import { useCurrency } from "../context/CurrencyContext";

const defaultCategories = []; // Empty array to allow deletion of all categories

const ManageCategoriesScreen = () => {
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { darkMode } = useContext(ThemeContext);
  const { receipts } = useContext(ReceiptContext);
  const { categories, addCategory, deleteCategory, addMultipleCategories } =
    useContext(CategoryContext);
  const { cleanupDeletedCategoryBudgets } = useContext(BudgetContext);
  const { categoryBudgets, setCategoryBudgets, updateCategoryBudget } =
    useContext(BudgetContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { formatCurrency } = useCurrency();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

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
      await addCategory(trimmed);
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
      await deleteCategory(category);
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

  const openCategoryModal = () => {
    setShowCategoryModal(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCategoryModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCategoryModal(false);
      setSelectedCategories([]);
    });
  };

  const toggleCategorySelection = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleAddSelectedCategories = async () => {
    if (selectedCategories.length === 0) {
      closeCategoryModal();
      return;
    }

    try {
      // Use addMultipleCategories which is designed to handle multiple categories properly
      await addMultipleCategories(selectedCategories);
      setSelectedCategories([]);
      closeCategoryModal();
    } catch (error) {
      console.error("Error adding categories:", error);
      Alert.alert("Error", "Failed to add some categories. Please try again.");
    }
  };

  const renderCategory = ({ item }) => (
    <Animated.View
      style={[
        styles.categoryCard,
        {
          backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
          shadowColor: theme.text,
        },
      ]}
    >
      <View style={styles.categoryContent}>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryIconContainer}>
            <Text style={styles.categoryIcon}>🏷️</Text>
          </View>
          <Text style={[styles.categoryText, { color: theme.text }]}>
            {item}
          </Text>
        </View>

        {!defaultCategories.includes(item) && (
          <TouchableOpacity
            onPress={() => handleDeleteCategory(item)}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
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
      <View style={styles.headerContent}>
        <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
          Welcome to
        </Text>
        <Text style={[styles.appName, { color: theme.text }]}>
          <Text style={styles.zennyAccent}>Categories</Text>
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Organize and manage your expense categories
        </Text>
      </View>
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
      <View style={styles.addSectionHeader}>
        <Text style={[styles.addSectionTitle, { color: theme.text }]}>
          Add New Category
        </Text>
        <Text
          style={[styles.addSectionSubtitle, { color: theme.textSecondary }]}
        >
          Create custom categories or browse from our collection
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter custom category name..."
          placeholderTextColor={theme.textSecondary}
          value={newCategory}
          onChangeText={setNewCategory}
          style={[
            styles.input,
            {
              borderColor: theme.textSecondary + "20",
              color: theme.text,
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
        />

        <TouchableOpacity
          onPress={handleAddCategory}
          style={[
            styles.addCustomButton,
            {
              backgroundColor: newCategory.trim() ? "#4CAF50" : "#E0E0E0",
            },
          ]}
          activeOpacity={0.8}
          disabled={!newCategory.trim()}
        >
          <Text
            style={[
              styles.addCustomButtonText,
              { color: newCategory.trim() ? "#FFFFFF" : "#666666" },
            ]}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.textSecondary + "20" },
          ]}
        />
        <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
          or
        </Text>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.textSecondary + "20" },
          ]}
        />
      </View>

      <TouchableOpacity
        onPress={openCategoryModal}
        style={[
          styles.browseButton,
          {
            backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
            borderColor: theme.textSecondary + "20",
            shadowColor: theme.text,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.browseButtonIcon}>📋</Text>
        <Text style={[styles.browseButtonText, { color: theme.text }]}>
          Browse Categories
        </Text>
        <Text style={styles.browseButtonArrow}>→</Text>
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

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        onRequestClose={closeCategoryModal}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={closeCategoryModal}
              style={styles.backButton}
            >
              <Text style={[styles.backButtonText, { color: theme.text }]}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Browse Categories
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            <Text
              style={[styles.modalSubtitle, { color: theme.textSecondary }]}
            >
              Select the categories you want to add to your list
            </Text>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {availableCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                const isAlreadyAdded = categories.includes(category);

                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor: darkMode
                          ? theme.cardBackground
                          : "#FFFFFF",
                        borderColor: isSelected
                          ? "#4CAF50"
                          : theme.textSecondary + "20",
                        opacity: isAlreadyAdded ? 0.6 : 1,
                      },
                    ]}
                    onPress={() =>
                      !isAlreadyAdded && toggleCategorySelection(category)
                    }
                    disabled={isAlreadyAdded}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalItemContent}>
                      <Text
                        style={[
                          styles.modalItemText,
                          {
                            color: isAlreadyAdded
                              ? theme.textSecondary
                              : theme.text,
                          },
                        ]}
                      >
                        {category}
                      </Text>
                      {isAlreadyAdded && (
                        <View style={styles.addedBadge}>
                          <Text style={styles.addedBadgeText}>Added</Text>
                        </View>
                      )}
                    </View>
                    {isSelected && (
                      <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                {
                  backgroundColor:
                    selectedCategories.length > 0 ? "#4CAF50" : "#E0E0E0",
                },
              ]}
              onPress={handleAddSelectedCategories}
              disabled={selectedCategories.length === 0}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  {
                    color:
                      selectedCategories.length > 0 ? "#FFFFFF" : "#666666",
                  },
                ]}
              >
                {selectedCategories.length === 0
                  ? "No categories selected"
                  : `Add ${selectedCategories.length} category${
                      selectedCategories.length > 1 ? "ies" : "y"
                    }`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    paddingVertical: 32,
    paddingTop: 16,
  },
  headerContent: {
    alignItems: "center",
    maxWidth: 300,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  zennyAccent: {
    color: "#4CAF50",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.7,
  },
  addSection: {
    marginBottom: 32,
    paddingHorizontal: spacing.screen,
  },
  addSectionHeader: {
    marginBottom: 20,
  },
  addSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  addSectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addCustomButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.medium,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
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
  addCustomButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 16,
    opacity: 0.6,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.medium,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  browseButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  browseButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  browseButtonArrow: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
  },
  categoriesContainer: {
    marginBottom: 24,
    paddingHorizontal: spacing.screen,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    marginTop: 8,
  },
  categoriesList: {
    paddingBottom: 20,
  },
  categoryCard: {
    borderRadius: radius.large,
    padding: 18,
    marginBottom: 12,
    marginHorizontal: spacing.screen,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50" + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF3B30" + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonIcon: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 40,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalScrollView: {
    flex: 1,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.medium,
    marginBottom: 12,
    borderWidth: 2,
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
  modalItemContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  addedBadge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  addedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalFooter: {
    paddingHorizontal: spacing.screen,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  modalButton: {
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
  modalButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ManageCategoriesScreen;

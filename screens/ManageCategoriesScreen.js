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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

const { width: screenWidth } = Dimensions.get("window");

// Zenny Brand Color Theme - Consistent throughout the app
const ZENNY_THEME = {
  // Primary Brand Colors
  primary: "#6366F1", // Indigo 500 - Main brand color
  primaryLight: "#818CF8", // Indigo 400
  primaryDark: "#4F46E5", // Indigo 600
  primaryBg: "#EEF2FF", // Indigo 50

  // Secondary Brand Colors
  secondary: "#8B5CF6", // Purple 500
  secondaryLight: "#A78BFA", // Purple 400
  secondaryDark: "#7C3AED", // Purple 600
  secondaryBg: "#F3F4F6", // Gray 100

  // Accent Colors
  accent: "#06B6D4", // Cyan 500
  accentLight: "#22D3EE", // Cyan 400
  accentDark: "#0891B2", // Cyan 600

  // Semantic Colors
  success: "#10B981", // Emerald 500
  successLight: "#34D399", // Emerald 400
  successDark: "#059669", // Emerald 600
  successBg: "#ECFDF5", // Emerald 50

  warning: "#F59E0B", // Amber 500
  warningLight: "#FBBF24", // Amber 400
  warningDark: "#D97706", // Amber 600
  warningBg: "#FFFBEB", // Amber 50

  danger: "#EF4444", // Red 500
  dangerLight: "#F87171", // Red 400
  dangerDark: "#DC2626", // Red 600
  dangerBg: "#FEF2F2", // Red 50

  // Neutral Colors
  background: "#FAFAFA", // Gray 50
  surface: "#FFFFFF",
  surfaceSecondary: "#F9FAFB", // Gray 50

  // Text Colors
  text: "#111827", // Gray 900
  textSecondary: "#6B7280", // Gray 500
  textMuted: "#9CA3AF", // Gray 400
  textInverse: "#FFFFFF",

  // Border Colors
  border: "#E5E7EB", // Gray 200
  borderLight: "#F3F4F6", // Gray 100

  // Shadow
  shadow: "rgba(99, 102, 241, 0.08)", // Primary color with opacity
  shadowLight: "rgba(0, 0, 0, 0.04)",
};

const defaultCategories = []; // Empty array to allow deletion of all categories

const ManageCategoriesScreen = () => {
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("custom"); // "custom" or "browse"

  const { darkMode } = useContext(ThemeContext);
  const { receipts } = useContext(ReceiptContext);
  const { categories, addCategory, deleteCategory, addMultipleCategories } =
    useContext(CategoryContext);
  const { cleanupDeletedCategoryBudgets } = useContext(BudgetContext);
  const { categoryBudgets, setCategoryBudgets, updateCategoryBudget } =
    useContext(BudgetContext);
  const { formatCurrency } = useCurrency();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;

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
      await addMultipleCategories(selectedCategories);
      setSelectedCategories([]);
      closeCategoryModal();
    } catch (error) {
      console.error("Error adding categories:", error);
      Alert.alert("Error", "Failed to add some categories. Please try again.");
    }
  };

  const getCategoryColor = (category, index) => {
    const colors = [
      ZENNY_THEME.primary,
      ZENNY_THEME.secondary,
      ZENNY_THEME.accent,
      ZENNY_THEME.success,
      ZENNY_THEME.warning,
      ZENNY_THEME.danger,
    ];
    return colors[index % colors.length];
  };

  const renderCategory = ({ item, index }) => {
    const categoryColor = getCategoryColor(item, index);
    const isUsed = receipts.some(
      (r) => r.category.toLowerCase() === item.toLowerCase()
    );

    return (
      <Animated.View
        style={[
          styles.categoryCard,
          {
            backgroundColor: darkMode ? "#1F2937" : ZENNY_THEME.surface,
            shadowColor: darkMode ? "#000000" : ZENNY_THEME.shadow,
          },
        ]}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryInfo}>
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: categoryColor + "20" },
              ]}
            >
              <Text style={styles.categoryIcon}>🏷️</Text>
            </View>
            <View style={styles.categoryDetails}>
              <Text
                style={[
                  styles.categoryText,
                  { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
                ]}
              >
                {item}
              </Text>
              {isUsed && (
                <Text
                  style={[
                    styles.categoryUsage,
                    { color: darkMode ? "#9CA3AF" : ZENNY_THEME.textMuted },
                  ]}
                >
                  {
                    receipts.filter(
                      (r) => r.category.toLowerCase() === item.toLowerCase()
                    ).length
                  }{" "}
                  receipts
                </Text>
              )}
            </View>
          </View>

          {!defaultCategories.includes(item) && (
            <TouchableOpacity
              onPress={() => handleDeleteCategory(item)}
              style={[
                styles.deleteButton,
                { backgroundColor: ZENNY_THEME.dangerBg },
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
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
      <View style={styles.headerContent}>
        <Text
          style={[
            styles.welcomeText,
            { color: darkMode ? "#9CA3AF" : ZENNY_THEME.textSecondary },
          ]}
        >
          Category Management
        </Text>
        <Text
          style={[
            styles.appName,
            { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
          ]}
        >
          Organize Your <Text style={styles.zennyAccent}>Expenses</Text>
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: darkMode ? "#9CA3AF" : ZENNY_THEME.textSecondary },
          ]}
        >
          Create and manage custom categories for better expense tracking
        </Text>
      </View>
    </Animated.View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "custom" && styles.activeTabButton,
          {
            backgroundColor:
              activeTab === "custom" ? ZENNY_THEME.primary : "transparent",
          },
        ]}
        onPress={() => setActiveTab("custom")}
      >
        <Text
          style={[
            styles.tabButtonText,
            {
              color:
                activeTab === "custom"
                  ? ZENNY_THEME.textInverse
                  : darkMode
                  ? "#9CA3AF"
                  : ZENNY_THEME.textSecondary,
            },
          ]}
        >
          Custom Categories
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "browse" && styles.activeTabButton,
          {
            backgroundColor:
              activeTab === "browse" ? ZENNY_THEME.primary : "transparent",
          },
        ]}
        onPress={() => setActiveTab("browse")}
      >
        <Text
          style={[
            styles.tabButtonText,
            {
              color:
                activeTab === "browse"
                  ? ZENNY_THEME.textInverse
                  : darkMode
                  ? "#9CA3AF"
                  : ZENNY_THEME.textSecondary,
            },
          ]}
        >
          Browse Templates
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCustomSection = () => (
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
        <Text
          style={[
            styles.addSectionTitle,
            { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
          ]}
        >
          Create New Category
        </Text>
        <Text
          style={[
            styles.addSectionSubtitle,
            { color: darkMode ? "#9CA3AF" : ZENNY_THEME.textSecondary },
          ]}
        >
          Add a custom category that fits your spending habits
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter category name..."
          placeholderTextColor={darkMode ? "#6B7280" : ZENNY_THEME.textMuted}
          value={newCategory}
          onChangeText={setNewCategory}
          style={[
            styles.input,
            {
              borderColor: darkMode ? "#374151" : ZENNY_THEME.border,
              color: darkMode ? "#F9FAFB" : ZENNY_THEME.text,
              backgroundColor: darkMode ? "#1F2937" : ZENNY_THEME.surface,
              shadowColor: darkMode ? "#000000" : ZENNY_THEME.shadow,
            },
          ]}
        />

        <TouchableOpacity
          onPress={handleAddCategory}
          style={[
            styles.addCustomButton,
            {
              backgroundColor: newCategory.trim()
                ? ZENNY_THEME.success
                : ZENNY_THEME.border,
            },
          ]}
          activeOpacity={0.8}
          disabled={!newCategory.trim()}
        >
          <Text
            style={[
              styles.addCustomButtonText,
              {
                color: newCategory.trim()
                  ? ZENNY_THEME.textInverse
                  : ZENNY_THEME.textMuted,
              },
            ]}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderBrowseSection = () => (
    <Animated.View
      style={[
        styles.browseSection,
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
      <View style={styles.browseSectionHeader}>
        <Text
          style={[
            styles.browseSectionTitle,
            { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
          ]}
        >
          Popular Categories
        </Text>
        <Text
          style={[
            styles.browseSectionSubtitle,
            { color: darkMode ? "#9CA3AF" : ZENNY_THEME.textSecondary },
          ]}
        >
          Choose from our curated collection of common expense categories
        </Text>
      </View>

      <TouchableOpacity
        onPress={openCategoryModal}
        style={[
          styles.browseButton,
          {
            backgroundColor: darkMode ? "#1F2937" : ZENNY_THEME.surface,
            borderColor: darkMode ? "#374151" : ZENNY_THEME.border,
            shadowColor: darkMode ? "#000000" : ZENNY_THEME.shadow,
          },
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.browseButtonContent}>
          <Text style={styles.browseButtonIcon}>📋</Text>
          <View style={styles.browseButtonTextContainer}>
            <Text
              style={[
                styles.browseButtonText,
                { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
              ]}
            >
              Browse All Categories
            </Text>
            <Text
              style={[
                styles.browseButtonSubtext,
                { color: darkMode ? "#9CA3AF" : ZENNY_THEME.textSecondary },
              ]}
            >
              {availableCategories.length} categories available
            </Text>
          </View>
        </View>
        <Text
          style={[styles.browseButtonArrow, { color: ZENNY_THEME.primary }]}
        >
          →
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: darkMode ? "#111827" : ZENNY_THEME.background },
      ]}
    >
      {categories.length === 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {renderTabBar()}
          {activeTab === "custom"
            ? renderCustomSection()
            : renderBrowseSection()}
          <View style={styles.categoriesContainer}>
            <Text
              style={[
                styles.sectionTitle,
                { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
              ]}
            >
              Your Categories
            </Text>
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyStateIconContainer,
                  { backgroundColor: ZENNY_THEME.primaryBg },
                ]}
              >
                <Text style={styles.emptyStateIcon}>🏷️</Text>
              </View>
              <Text
                style={[
                  styles.emptyStateTitle,
                  { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
                ]}
              >
                No categories yet
              </Text>
              <Text
                style={[
                  styles.emptyStateText,
                  { color: darkMode ? "#9CA3AF" : ZENNY_THEME.textSecondary },
                ]}
              >
                Start by creating your first category above
              </Text>
            </View>
          </View>
          <View style={styles.bottomSpacing} />
        </ScrollView>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          renderItem={renderCategory}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderTabBar()}
              {activeTab === "custom"
                ? renderCustomSection()
                : renderBrowseSection()}
              <View style={styles.categoriesContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
                  ]}
                >
                  Your Categories ({categories.length})
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
          style={[
            styles.modalContainer,
            { backgroundColor: darkMode ? "#111827" : ZENNY_THEME.background },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={closeCategoryModal}
              style={styles.backButton}
            >
              <Text
                style={[
                  styles.backButtonText,
                  { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
                ]}
              >
                ← Back
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.modalTitle,
                { color: darkMode ? "#F9FAFB" : ZENNY_THEME.text },
              ]}
            >
              Browse Categories
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalSubtitle,
                { color: darkMode ? "#9CA3AF" : ZENNY_THEME.textSecondary },
              ]}
            >
              Select categories to add to your collection
            </Text>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {availableCategories.map((category, index) => {
                const isSelected = selectedCategories.includes(category);
                const isAlreadyAdded = categories.includes(category);
                const categoryColor = getCategoryColor(category, index);

                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.modalItem,
                      {
                        backgroundColor: darkMode
                          ? "#1F2937"
                          : ZENNY_THEME.surface,
                        borderColor: isSelected
                          ? categoryColor
                          : darkMode
                          ? "#374151"
                          : ZENNY_THEME.border,
                        opacity: isAlreadyAdded ? 0.6 : 1,
                        shadowColor: darkMode ? "#000000" : ZENNY_THEME.shadow,
                      },
                    ]}
                    onPress={() =>
                      !isAlreadyAdded && toggleCategorySelection(category)
                    }
                    disabled={isAlreadyAdded}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalItemContent}>
                      <View
                        style={[
                          styles.modalItemIcon,
                          { backgroundColor: categoryColor + "20" },
                        ]}
                      >
                        <Text style={styles.modalItemIconText}>🏷️</Text>
                      </View>
                      <View style={styles.modalItemTextContainer}>
                        <Text
                          style={[
                            styles.modalItemText,
                            {
                              color: isAlreadyAdded
                                ? darkMode
                                  ? "#6B7280"
                                  : ZENNY_THEME.textMuted
                                : darkMode
                                ? "#F9FAFB"
                                : ZENNY_THEME.text,
                            },
                          ]}
                        >
                          {category}
                        </Text>
                        {isAlreadyAdded && (
                          <View
                            style={[
                              styles.addedBadge,
                              { backgroundColor: ZENNY_THEME.successBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.addedBadgeText,
                                { color: ZENNY_THEME.success },
                              ]}
                            >
                              Added
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <View
                        style={[
                          styles.checkmarkContainer,
                          { backgroundColor: categoryColor },
                        ]}
                      >
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
                    selectedCategories.length > 0
                      ? ZENNY_THEME.success
                      : ZENNY_THEME.border,
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
                      selectedCategories.length > 0
                        ? ZENNY_THEME.textInverse
                        : ZENNY_THEME.textMuted,
                  },
                ]}
              >
                {selectedCategories.length === 0
                  ? "No categories selected"
                  : `Add ${selectedCategories.length} categor${
                      selectedCategories.length === 1 ? "y" : "ies"
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
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  zennyAccent: {
    color: ZENNY_THEME.primary,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.7,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.screen,
    marginBottom: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: radius.medium,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.small,
    alignItems: "center",
  },
  activeTabButton: {
    shadowColor: ZENNY_THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
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
  browseSection: {
    marginBottom: 32,
    paddingHorizontal: spacing.screen,
  },
  browseSectionHeader: {
    marginBottom: 20,
  },
  browseSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  browseSectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  browseButton: {
    paddingVertical: 20,
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
  browseButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  browseButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  browseButtonTextContainer: {
    flex: 1,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  browseButtonSubtext: {
    fontSize: 14,
    fontWeight: "400",
  },
  browseButtonArrow: {
    fontSize: 20,
    fontWeight: "600",
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryText: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryUsage: {
    fontSize: 13,
    fontWeight: "400",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 32,
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
    borderBottomColor: ZENNY_THEME.border,
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
    alignItems: "center",
  },
  modalItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalItemIconText: {
    fontSize: 16,
  },
  modalItemTextContainer: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  addedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  checkmark: {
    color: ZENNY_THEME.textInverse,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalFooter: {
    paddingHorizontal: spacing.screen,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: ZENNY_THEME.border,
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

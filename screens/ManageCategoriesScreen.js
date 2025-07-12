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

// Simple list of all available categories
const allAvailableCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Housing",
  "Healthcare",
  "Entertainment",
  "Education",
  "Groceries",
  "Restaurants",
  "Coffee & Drinks",
  "Fast Food",
  "Takeout",
  "Alcohol",
  "Snacks",
  "Gas",
  "Public Transit",
  "Ride Sharing",
  "Car Maintenance",
  "Parking",
  "Tolls",
  "Car Insurance",
  "Car Payment",
  "Clothing",
  "Electronics",
  "Home & Garden",
  "Books",
  "Gifts",
  "Personal Care",
  "Beauty",
  "Electricity",
  "Water",
  "Internet",
  "Phone",
  "Cable/Streaming",
  "Gas/Heating",
  "Trash",
  "Rent",
  "Mortgage",
  "Home Insurance",
  "Property Tax",
  "Home Maintenance",
  "Furniture",
  "Decor",
  "Medical Bills",
  "Dental",
  "Vision",
  "Prescriptions",
  "Health Insurance",
  "Fitness",
  "Supplements",
  "Movies",
  "Games",
  "Sports",
  "Concerts",
  "Hobbies",
  "Vacations",
  "Travel",
  "Tuition",
  "Books & Supplies",
  "Student Loans",
  "Courses",
  "Workshops",
  "Business Expenses",
  "Work Supplies",
  "Professional Development",
  "Pets",
  "Childcare",
  "Charity",
  "Investments",
  "Savings",
  "Emergency Fund",
  "Miscellaneous",
  "Fees",
  "Taxes",
  "Insurance",
  "Legal",
  "Banking",
  "ATM Fees",
];

const ManageCategoriesScreen = () => {
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { darkMode } = useContext(ThemeContext);
  const { receipts } = useContext(ReceiptContext);
  const {
    categories,
    addCategory,
    deleteCategory,
    addMultipleCategories,
    availableCategories,
  } = useContext(CategoryContext);
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

  // Debug logs at the top of the component
  console.log(
    "allAvailableCategories:",
    availableCategories.length,
    availableCategories
  );
  console.log("categories (user's current):", categories.length, categories);

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
    console.log("Opening category modal");
    console.log("Available categories:", allAvailableCategories.length);
    console.log("Current categories:", categories);
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
    });
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
        <TouchableOpacity
          onPress={() => handleDeleteCategory(item)}
          style={styles.deleteButton}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
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
        Personalize your expense tracking
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
        placeholder="Add custom category..."
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
        <Text style={styles.addButtonText}>➕ Add Custom</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategoryGroup = ({ item: group }) => {
    const isExpanded = expandedGroups.has(group.title);
    const availableInGroup = group.categories.filter(
      (cat) => !categories.includes(cat)
    );

    console.log(
      `Group: ${group.title}, Available: ${availableInGroup.length}, Total: ${group.categories.length}`
    );

    // Show all groups initially, even if some categories are already added
    // This helps users see what's available and what they already have
    return (
      <View style={styles.groupContainer}>
        <TouchableOpacity
          style={[
            styles.groupHeader,
            {
              backgroundColor: darkMode ? theme.cardBackground : "#f0f0f0",
              borderColor: darkMode ? theme.textSecondary + "30" : "#e0e0e0",
            },
          ]}
          onPress={() => toggleGroupExpansion(group.title)}
          activeOpacity={0.8}
        >
          <Text style={[styles.groupTitle, { color: theme.text }]}>
            {group.title}
          </Text>
          <Text style={[styles.expandIcon, { color: theme.textSecondary }]}>
            {isExpanded ? "▼" : "▶"}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.groupContent}>
            {group.categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              const isAlreadyAdded = categories.includes(category);

              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.selectionItem,
                    {
                      backgroundColor: darkMode
                        ? theme.cardBackground
                        : "#FFFFFF",
                      borderColor: isSelected
                        ? "#4CAF50"
                        : theme.textSecondary + "30",
                      opacity: isAlreadyAdded ? 0.5 : 1,
                    },
                  ]}
                  onPress={() =>
                    !isAlreadyAdded && toggleCategorySelection(category)
                  }
                  disabled={isAlreadyAdded}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.selectionItemText,
                      {
                        color: isAlreadyAdded
                          ? theme.textSecondary
                          : theme.text,
                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    {category}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  {isAlreadyAdded && (
                    <Text
                      style={[
                        styles.alreadyAdded,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Added
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {categories.length === 0 ? (
        <>
          {renderHeader()}
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
                Choose from our curated list or create your own custom
                categories
              </Text>
              <TouchableOpacity
                style={[styles.chooseButton, { backgroundColor: "#4CAF50" }]}
                onPress={openCategoryModal}
                activeOpacity={0.8}
              >
                <Text style={styles.chooseButtonText}>
                  🎯 Choose Categories
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {renderAddSection()}
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
              <View style={styles.categoriesContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Your Categories ({categories.length})
                  </Text>
                  <TouchableOpacity
                    style={[styles.addMoreButton, { borderColor: "#4CAF50" }]}
                    onPress={openCategoryModal}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.addMoreText, { color: "#4CAF50" }]}>
                      + Add More
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {renderAddSection()}
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
        transparent={true}
        animationType="none"
        onRequestClose={closeCategoryModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "98%",
              maxHeight: "95%",
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 20,
              borderWidth: 4,
              borderColor: "red", // Debug border
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 16,
                color: "#222",
                textAlign: "center",
              }}
            >
              Choose Categories
            </Text>
            <ScrollView style={{ flexGrow: 0, marginBottom: 16 }}>
              {availableCategories.map((category) => {
                const isAlreadyAdded = categories.includes(category);
                const isSelected = selectedCategories.includes(category);
                return (
                  <TouchableOpacity
                    key={category}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      backgroundColor: isAlreadyAdded
                        ? "#eee"
                        : isSelected
                        ? "#e6f7ff"
                        : "#f9f9f9",
                      marginBottom: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isSelected ? "#007aff" : "#eee",
                      flexDirection: "row",
                      alignItems: "center",
                      opacity: isAlreadyAdded ? 0.5 : 1,
                    }}
                    onPress={() => {
                      if (isAlreadyAdded) return;
                      setSelectedCategories((prev) =>
                        prev.includes(category)
                          ? prev.filter((c) => c !== category)
                          : [...prev, category]
                      );
                    }}
                    disabled={isAlreadyAdded}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: isAlreadyAdded ? "#888" : "#007aff",
                        fontWeight: "600",
                        fontSize: 16,
                        flex: 1,
                      }}
                    >
                      {category}
                    </Text>
                    {isSelected && (
                      <Text
                        style={{
                          color: "#007aff",
                          fontSize: 20,
                          marginLeft: 8,
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={{
                marginTop: 8,
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor:
                  selectedCategories.length > 0 ? "#4CAF50" : "#ccc",
                alignItems: "center",
              }}
              onPress={() => {
                if (selectedCategories.length === 0) {
                  setSelectedCategories([]);
                  closeCategoryModal();
                  return;
                }
                selectedCategories.forEach((cat) => {
                  if (!categories.includes(cat)) addCategory(cat);
                });
                setSelectedCategories([]);
                closeCategoryModal();
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                {selectedCategories.length === 0
                  ? "Go Back"
                  : `Add ${selectedCategories.length} Selected`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 4,
  },
  addMoreButton: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.small,
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: "600",
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
    marginBottom: 24,
  },
  chooseButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
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
  chooseButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: radius.large,
    padding: 20,
    borderWidth: 2, // Debug border
    borderColor: "red", // Debug border
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  selectionList: {
    flex: 1,
  },
  groupContainer: {
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radius.medium,
    borderWidth: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  expandIcon: {
    fontSize: 20,
  },
  groupContent: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 12,
  },
  selectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 16,
    marginBottom: 8,
  },
  selectionItemText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  checkmark: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "700",
  },
  alreadyAdded: {
    fontSize: 14,
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ManageCategoriesScreen;

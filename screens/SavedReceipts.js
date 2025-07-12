import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReceiptContext } from "../context/ReceiptContext";
import { BudgetContext } from "../context/BudgetContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { useCurrency } from "../context/CurrencyContext";
import { Picker } from "@react-native-picker/picker";
import { CategoryContext } from "../context/CategoryContext";

const { width: screenWidth } = Dimensions.get("window");

const SavedReceipts = () => {
  const { receipts, deleteReceipt } = useContext(ReceiptContext);
  const { darkMode } = useContext(ThemeContext);
  const { categories } = useContext(CategoryContext);
  const { categoryBudgets, updateCategoryBudget, removeExpense, expenses } =
    useContext(BudgetContext);
  const { formatCurrency, convertCurrency } = useCurrency();
  const [searchTag, setSearchTag] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const theme = darkMode ? darkTheme : lightTheme;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();
  const isValidUri = (uri) =>
    (typeof uri === "string" && uri.startsWith("http")) ||
    uri.startsWith("file");

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

  useEffect(() => {
    console.log("Categories from context:", categories);
    const formatted = [
      { label: "All Categories", value: null },
      ...categories.map((cat) => ({
        label: cat,
        value: cat,
      })),
    ];
    console.log("Formatted dropdown items:", formatted);
    setCategoryItems(formatted);
  }, [categories]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedReceipt(item);
        setModalVisible(true);
      }}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.receiptCard,
          {
            backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
            shadowColor: theme.text,
          },
        ]}
      >
        {item.image && isValidUri(item.image) ? (
          <Image source={{ uri: item.image }} style={styles.receiptImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageIcon}>🧾</Text>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <View style={styles.receiptInfo}>
          <Text
            style={[
              styles.receiptAmount,
              { color: darkMode ? "#fff" : theme.text },
            ]}
          >
            {formatCurrency(convertCurrency(item.amount))}
          </Text>
          <Text
            style={[
              styles.receiptCategory,
              { color: darkMode ? "#fff" : theme.textSecondary },
            ]}
          >
            {item.category}
          </Text>
          {item.tag && (
            <Text style={[styles.receiptTag, { color: "#4CAF50" }]}>
              #{item.tag}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredReceipts = receipts.filter((r) => {
    const tagMatch = searchTag.trim()
      ? r.tag?.toLowerCase().includes(searchTag.trim().toLowerCase())
      : true;

    const categoryMatch =
      selectedCategory && selectedCategory !== ""
        ? r.category.toLowerCase() === selectedCategory.toLowerCase()
        : true;
    return tagMatch && categoryMatch;
  });

  const handleDeleteReceipt = async (id) => {
    console.log("🧨 Trying to delete receipt with ID:", id);
    console.log("🧨 ID type:", typeof id);
    console.log("🧨 Selected receipt:", selectedReceipt);

    if (!id) {
      console.error("❌ No ID provided for deletion");
      Alert.alert("Error", "Cannot delete receipt: No ID found");
      return;
    }

    try {
      if (
        selectedReceipt &&
        selectedReceipt.amount &&
        selectedReceipt.category
      ) {
        removeExpense(selectedReceipt.id);
        console.log(`✅ Removed expense from stats`);
      }

      // Delete the receipt
      await deleteReceipt(id);
      console.log("✅ Successfully deleted receipt");
      setModalVisible(false);
    } catch (error) {
      console.error("❌ Error deleting receipt:", error);
      Alert.alert("Error", "Failed to delete receipt. Please try again.");
    }
  };

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyStateContainer,
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
      <Text style={styles.emptyStateIcon}>🧾</Text>
      <Text
        style={[
          styles.emptyStateTitle,
          { color: darkMode ? "#fff" : theme.text },
        ]}
      >
        No receipts yet
      </Text>
      <Text
        style={[
          styles.emptyStateSubtitle,
          { color: darkMode ? "#fff" : theme.textSecondary },
        ]}
      >
        When you add a receipt, it will show up here for easy tracking and
        filtering.
      </Text>
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
      <Text
        style={[
          styles.welcomeText,
          { color: darkMode ? "#fff" : theme.textSecondary },
        ]}
      >
        Welcome to your
      </Text>
      <Text style={[styles.appName, { color: darkMode ? "#fff" : theme.text }]}>
        <Text style={styles.zennyAccent}>Receipts</Text>
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: darkMode ? "#fff" : theme.textSecondary },
        ]}
      >
        Track and manage your expenses
      </Text>
    </Animated.View>
  );

  const renderSearchAndFilters = () => (
    <Animated.View
      style={[
        styles.filtersContainer,
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
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by tag..."
          placeholderTextColor={darkMode ? "#fff" : theme.textSecondary}
          value={searchTag}
          onChangeText={setSearchTag}
          style={[
            styles.searchInput,
            {
              borderColor: darkMode ? "#fff" : theme.textSecondary + "30",
              color: darkMode ? "#fff" : theme.text,
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
        />
      </View>

      {/* Category Filter */}
      <View
        style={[
          styles.pickerWrapper,
          {
            backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
            borderColor: darkMode ? "#fff" : theme.textSecondary + "30",
          },
        ]}
      >
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          dropdownIconColor={darkMode ? "#fff" : theme.text}
          style={{
            color: darkMode ? "#fff" : theme.text,
            fontSize: 16,
          }}
        >
          <Picker.Item label="All Categories" value={null} />
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
    </Animated.View>
  );

  // SOLUTION 2: Use ScrollView instead of FlatList when dropdown is open
  if (categoryOpen) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentWithDropdown}
          >
            {renderHeader()}
            {renderSearchAndFilters()}

            {/* Render receipts grid manually when dropdown is open */}
            {filteredReceipts.length > 0 ? (
              <View style={styles.receiptsGrid}>
                {filteredReceipts.map((item, index) => (
                  <View key={item.id.toString()} style={styles.gridItemWrapper}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedReceipt(item);
                        setModalVisible(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.receiptCard,
                          {
                            backgroundColor: darkMode
                              ? theme.cardBackground
                              : "#FFFFFF",
                            shadowColor: theme.text,
                          },
                        ]}
                      >
                        {item.image && isValidUri(item.image) ? (
                          <Image
                            source={{ uri: item.image }}
                            style={styles.receiptImage}
                          />
                        ) : (
                          <View style={styles.noImageContainer}>
                            <Text style={styles.noImageIcon}>🧾</Text>
                            <Text style={styles.noImageText}>No Image</Text>
                          </View>
                        )}
                        <View style={styles.receiptInfo}>
                          <Text
                            style={[
                              styles.receiptAmount,
                              { color: darkMode ? "#fff" : theme.text },
                            ]}
                          >
                            {formatCurrency(convertCurrency(item.amount))}
                          </Text>
                          <Text
                            style={[
                              styles.receiptCategory,
                              {
                                color: darkMode ? "#fff" : theme.textSecondary,
                              },
                            ]}
                          >
                            {item.category}
                          </Text>
                          {item.tag && (
                            <Text
                              style={[styles.receiptTag, { color: "#4CAF50" }]}
                            >
                              #{item.tag}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noResultsContainer}>
                <Text
                  style={[
                    styles.noResultsText,
                    { color: darkMode ? "#fff" : theme.textSecondary },
                  ]}
                >
                  No matching receipts found.
                </Text>
              </View>
            )}

            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Modal */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: darkMode
                      ? theme.cardBackground
                      : "#FFFFFF",
                  },
                ]}
              >
                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>

                {selectedReceipt && (
                  <>
                    {selectedReceipt.image ? (
                      <Image
                        source={{ uri: selectedReceipt.image }}
                        style={styles.modalImage}
                      />
                    ) : (
                      <View style={styles.modalNoImage}>
                        <Text style={styles.modalNoImageIcon}>🧾</Text>
                        <Text
                          style={[
                            styles.modalNoImageText,
                            { color: darkMode ? "#fff" : theme.textSecondary },
                          ]}
                        >
                          Image not available
                        </Text>
                      </View>
                    )}

                    <View style={styles.modalInfo}>
                      <Text
                        style={[
                          styles.modalAmount,
                          { color: darkMode ? "#fff" : theme.text },
                        ]}
                      >
                        {formatCurrency(
                          convertCurrency(selectedReceipt.amount)
                        )}
                      </Text>
                      <Text
                        style={[
                          styles.modalCategory,
                          { color: darkMode ? "#fff" : theme.textSecondary },
                        ]}
                      >
                        {selectedReceipt.category}
                      </Text>
                      <Text style={[styles.modalTag, { color: "#4CAF50" }]}>
                        #{selectedReceipt.tag || "No tag"}
                      </Text>
                    </View>

                    <View style={styles.modalButtonRow}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setModalVisible(false);
                          navigation.navigate("Add Receipt", {
                            receiptToEdit: selectedReceipt,
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          Alert.alert(
                            "Delete Receipt",
                            "Are you sure you want to delete this receipt?",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () =>
                                  handleDeleteReceipt(selectedReceipt.id),
                              },
                            ]
                          );
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {receipts.length === 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderHeader()}
            {renderEmptyState()}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        ) : (
          <View style={styles.container}>
            {/* Fixed Header and Filters */}
            <View style={styles.fixedHeader}>
              {renderHeader()}
              {renderSearchAndFilters()}
            </View>

            {/* FlatList for receipts */}
            <FlatList
              data={filteredReceipts}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              renderItem={renderItem}
              contentContainerStyle={styles.flatListContent}
              columnWrapperStyle={styles.gridRow}
              ListEmptyComponent={
                <View style={styles.noResultsContainer}>
                  <Text
                    style={[
                      styles.noResultsText,
                      { color: darkMode ? "#fff" : theme.textSecondary },
                    ]}
                  >
                    No matching receipts found.
                  </Text>
                </View>
              }
              ListFooterComponent={<View style={styles.bottomSpacing} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                },
              ]}
            >
              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>

              {selectedReceipt && (
                <>
                  {selectedReceipt.image ? (
                    <Image
                      source={{ uri: selectedReceipt.image }}
                      style={styles.modalImage}
                    />
                  ) : (
                    <View style={styles.modalNoImage}>
                      <Text style={styles.modalNoImageIcon}>🧾</Text>
                      <Text
                        style={[
                          styles.modalNoImageText,
                          { color: darkMode ? "#fff" : theme.textSecondary },
                        ]}
                      >
                        Image not available
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalInfo}>
                    <Text
                      style={[
                        styles.modalAmount,
                        { color: darkMode ? "#fff" : theme.text },
                      ]}
                    >
                      {formatCurrency(convertCurrency(selectedReceipt.amount))}
                    </Text>
                    <Text
                      style={[
                        styles.modalCategory,
                        { color: darkMode ? "#fff" : theme.textSecondary },
                      ]}
                    >
                      {selectedReceipt.category}
                    </Text>
                    <Text style={[styles.modalTag, { color: "#4CAF50" }]}>
                      #{selectedReceipt.tag || "No tag"}
                    </Text>
                  </View>

                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate("Add Receipt", {
                          receiptToEdit: selectedReceipt,
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          "Delete Receipt",
                          "Are you sure you want to delete this receipt?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () =>
                                handleDeleteReceipt(selectedReceipt.id),
                            },
                          ]
                        );
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  scrollContentWithDropdown: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 20,
  },
  fixedHeader: {
    backgroundColor: "transparent",
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
  filtersContainer: {
    paddingBottom: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 16,
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
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: radius.medium,
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
  // Grid layout for ScrollView
  receiptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  gridItemWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  flatListContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: 20,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  receiptCard: {
    width: "100%",
    borderRadius: radius.large,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  receiptImage: {
    width: "100%",
    height: 100,
    borderRadius: radius.medium,
    marginBottom: 8,
  },
  noImageContainer: {
    width: "100%",
    height: 120,
    borderRadius: radius.medium,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  noImageIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  noImageText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  receiptInfo: {
    alignItems: "center",
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  receiptCategory: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  receiptTag: {
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalCard: {
    width: "90%",
    maxWidth: 400,
    borderRadius: radius.large,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  closeText: {
    fontSize: 32,
    color: "#FF3B30",
    fontWeight: "bold",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: radius.medium,
    marginBottom: 20,
  },
  modalNoImage: {
    width: "100%",
    height: 200,
    borderRadius: radius.medium,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalNoImageIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalNoImageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalAmount: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalCategory: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalTag: {
    fontSize: 14,
    fontWeight: "600",
    fontStyle: "italic",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.medium,
    flex: 1,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.medium,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SavedReceipts;

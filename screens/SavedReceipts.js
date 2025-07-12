import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
  StatusBar,
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const theme = darkMode ? darkTheme : lightTheme;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnims = useRef([]).current;

  const navigation = useNavigation();
  const isValidUri = (uri) =>
    (typeof uri === "string" && uri.startsWith("http")) ||
    uri.startsWith("file");

  useEffect(() => {
    // Initialize card animations
    cardAnims.length = receipts.length;
    for (let i = 0; i < receipts.length; i++) {
      if (!cardAnims[i]) {
        cardAnims[i] = new Animated.Value(0);
      }
    }

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

    // Animate cards with stagger
    const cardAnimations = cardAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, cardAnimations).start();
  }, [receipts.length]);

  useEffect(() => {
    const formatted = [
      { label: "All Categories", value: null },
      ...categories.map((cat) => ({
        label: cat,
        value: cat,
      })),
    ];
    setCategoryItems(formatted);
  }, [categories]);

  const renderGridCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: cardAnims[index] || 1,
          transform: [
            {
              translateY:
                cardAnims[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }) || 0,
            },
          ],
        },
      ]}
    >
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
          {/* Receipt Image */}
          <View style={styles.imageContainer}>
            {item.image && isValidUri(item.image) ? (
              <Image source={{ uri: item.image }} style={styles.receiptImage} />
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageIcon}>🧾</Text>
              </View>
            )}
          </View>

          {/* Receipt Info */}
          <View style={styles.receiptInfo}>
            <Text style={[styles.receiptAmount, { color: theme.text }]}>
              {formatCurrency(convertCurrency(item.amount))}
            </Text>
            <Text style={[styles.receiptCategory, { color: theme.subtleText }]}>
              {item.category}
            </Text>
            {item.tag && (
              <Text style={[styles.receiptTag, { color: theme.primary }]}>
                #{item.tag}
              </Text>
            )}
            <Text style={[styles.receiptDate, { color: theme.subtleText }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderListCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.listCardContainer,
        {
          opacity: cardAnims[index] || 1,
          transform: [
            {
              translateY:
                cardAnims[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }) || 0,
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          setSelectedReceipt(item);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.listCard,
            {
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
        >
          {/* Receipt Image */}
          <View style={styles.listImageContainer}>
            {item.image && isValidUri(item.image) ? (
              <Image
                source={{ uri: item.image }}
                style={styles.listReceiptImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.listNoImageContainer}>
                <Text style={styles.listNoImageIcon}>🧾</Text>
              </View>
            )}
          </View>

          {/* Receipt Details */}
          <View style={styles.listCardDetails}>
            <View style={styles.listCardHeader}>
              <Text style={[styles.listCardAmount, { color: theme.text }]}>
                {formatCurrency(convertCurrency(item.amount))}
              </Text>
              <Text
                style={[styles.listCardCategory, { color: theme.subtleText }]}
              >
                {item.category}
              </Text>
            </View>

            {item.tag && (
              <Text style={[styles.listCardTag, { color: theme.primary }]}>
                #{item.tag}
              </Text>
            )}

            <Text style={[styles.listCardDate, { color: theme.subtleText }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
    if (!id) {
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
      }

      await deleteReceipt(id);
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting receipt:", error);
      Alert.alert("Error", "Failed to delete receipt. Please try again.");
    }
  };

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyStateContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.emptyStateIconContainer}>
        <Text style={styles.emptyStateIcon}>🧾</Text>
      </View>
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
        No receipts yet
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.subtleText }]}>
        Start tracking your expenses by adding your first receipt.
      </Text>

      <TouchableOpacity
        style={[styles.addFirstButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("Add Receipt")}
      >
        <Text style={styles.addFirstButtonText}>Add Your First Receipt</Text>
      </TouchableOpacity>
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
      <View style={styles.headerTop}>
        <Text style={[styles.appName, { color: theme.text }]}>Receipts</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Add Receipt")}>
          <Text style={{ fontSize: 20 }}>📷</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.headerSubtitle, { color: theme.subtleText }]}>
        {receipts.length} receipt{receipts.length !== 1 ? "s" : ""} •{" "}
        {filteredReceipts.length} showing
      </Text>
    </Animated.View>
  );

  const renderSearchAndFilters = () => (
    <Animated.View
      style={[
        styles.filtersContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchWrapper,
            {
              borderColor: isSearchFocused ? theme.primary : theme.border,
              backgroundColor: theme.cardBackground,
            },
          ]}
        >
          <Text style={[styles.searchIcon, { color: theme.subtleText }]}>
            🔍
          </Text>
          <TextInput
            placeholder="Search by tag..."
            placeholderTextColor={theme.subtleText}
            value={searchTag}
            onChangeText={setSearchTag}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchTag.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchTag("")}
              style={styles.clearButton}
            >
              <Text
                style={[styles.clearButtonText, { color: theme.subtleText }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterRow}>
        <View
          style={[
            styles.pickerWrapper,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Text style={[styles.filterLabel, { color: theme.subtleText }]}>
            Category
          </Text>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={[styles.picker, { color: theme.text }]}
            dropdownIconColor={theme.text}
          >
            <Picker.Item label="All Categories" value={null} />
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        {selectedCategory && (
          <TouchableOpacity
            style={[
              styles.clearFilterButton,
              { backgroundColor: theme.danger },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      {receipts.length === 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <View style={styles.mainContainer}>
          {/* Fixed Header and Filters */}
          <View style={styles.fixedHeader}>
            {renderHeader()}
            {renderSearchAndFilters()}
          </View>

          {/* View Mode Toggle */}
          <View style={styles.viewModeContainer}>
            <View
              style={[
                styles.viewModeWrapper,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === "grid" && { backgroundColor: theme.primary },
                ]}
                onPress={() => setViewMode("grid")}
              >
                <Text
                  style={[
                    styles.viewModeText,
                    {
                      color: viewMode === "grid" ? "#FFFFFF" : theme.subtleText,
                    },
                  ]}
                >
                  ⬜
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewModeButton,
                  viewMode === "list" && { backgroundColor: theme.primary },
                ]}
                onPress={() => setViewMode("list")}
              >
                <Text
                  style={[
                    styles.viewModeText,
                    {
                      color: viewMode === "list" ? "#FFFFFF" : theme.subtleText,
                    },
                  ]}
                >
                  ☰
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FlatList */}
          <FlatList
            key={viewMode} // Force re-render when view mode changes
            data={filteredReceipts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={viewMode === "grid" ? 2 : 1}
            renderItem={viewMode === "grid" ? renderGridCard : renderListCard}
            contentContainerStyle={[
              styles.flatListContent,
              viewMode === "list" && styles.listFlatListContent,
            ]}
            columnWrapperStyle={
              viewMode === "grid" ? styles.gridRow : undefined
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.noResultsContainer}>
                <Text
                  style={[styles.noResultsIcon, { color: theme.subtleText }]}
                >
                  🔍
                </Text>
                <Text
                  style={[styles.noResultsText, { color: theme.subtleText }]}
                >
                  No receipts found matching your search
                </Text>
                <TouchableOpacity
                  style={[
                    styles.resetFiltersButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => {
                    setSearchTag("");
                    setSelectedCategory(null);
                  }}
                >
                  <Text style={styles.resetFiltersText}>Reset Filters</Text>
                </TouchableOpacity>
              </View>
            }
            ListFooterComponent={<View style={styles.bottomSpacing} />}
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
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
              },
            ]}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeText, { color: theme.danger }]}>×</Text>
            </TouchableOpacity>

            {selectedReceipt && (
              <>
                {/* Receipt Image */}
                <View style={styles.modalImageContainer}>
                  {selectedReceipt.image ? (
                    <Image
                      source={{ uri: selectedReceipt.image }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.modalNoImage,
                        { backgroundColor: theme.border },
                      ]}
                    >
                      <Text style={styles.modalNoImageIcon}>🧾</Text>
                      <Text
                        style={[
                          styles.modalNoImageText,
                          { color: theme.subtleText },
                        ]}
                      >
                        No Image Available
                      </Text>
                    </View>
                  )}
                </View>

                {/* Receipt Details */}
                <View style={styles.modalDetails}>
                  <Text style={[styles.modalAmount, { color: theme.text }]}>
                    {formatCurrency(convertCurrency(selectedReceipt.amount))}
                  </Text>

                  <View style={styles.modalInfoRow}>
                    <View style={styles.modalInfoItem}>
                      <Text
                        style={[
                          styles.modalInfoLabel,
                          { color: theme.subtleText },
                        ]}
                      >
                        Category
                      </Text>
                      <Text
                        style={[styles.modalInfoValue, { color: theme.text }]}
                      >
                        {selectedReceipt.category}
                      </Text>
                    </View>

                    <View style={styles.modalInfoItem}>
                      <Text
                        style={[
                          styles.modalInfoLabel,
                          { color: theme.subtleText },
                        ]}
                      >
                        Date
                      </Text>
                      <Text
                        style={[styles.modalInfoValue, { color: theme.text }]}
                      >
                        {new Date(selectedReceipt.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {selectedReceipt.tag && (
                    <View style={styles.modalTagContainer}>
                      <Text
                        style={[
                          styles.modalInfoLabel,
                          { color: theme.subtleText },
                        ]}
                      >
                        Tag
                      </Text>
                      <Text style={[styles.modalTag, { color: theme.primary }]}>
                        #{selectedReceipt.tag}
                      </Text>
                    </View>
                  )}

                  {selectedReceipt.notes && (
                    <View style={styles.modalNotesContainer}>
                      <Text
                        style={[
                          styles.modalInfoLabel,
                          { color: theme.subtleText },
                        ]}
                      >
                        Notes
                      </Text>
                      <Text style={[styles.modalNotes, { color: theme.text }]}>
                        {selectedReceipt.notes}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.editButton,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={() => {
                      setModalVisible(false);
                      setTimeout(() => {
                        navigation.navigate("Add Receipt", {
                          receiptToEdit: selectedReceipt,
                        });
                      }, 300);
                    }}
                  >
                    <Text style={styles.modalButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.deleteButton,
                      { backgroundColor: theme.danger },
                    ]}
                    onPress={() => {
                      Alert.alert(
                        "Delete Receipt",
                        "Are you sure you want to delete this receipt? This action cannot be undone.",
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
                  >
                    <Text style={styles.modalButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    flexGrow: 1,
  },
  fixedHeader: {
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "400",
  },
  viewModeContainer: {
    paddingHorizontal: spacing.screen,
    marginBottom: 16,
  },
  viewModeWrapper: {
    flexDirection: "row",
    borderRadius: radius.medium,
    padding: 4,
    alignSelf: "flex-start",
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.small,
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  filtersContainer: {
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  picker: {
    fontSize: 16,
    fontWeight: "500",
  },
  clearFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.medium,
  },
  clearFilterText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  flatListContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
  },
  listFlatListContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  cardContainer: {
    width: "48%",
    marginBottom: 16,
  },
  receiptCard: {
    borderRadius: radius.large,
    padding: 16,
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
  imageContainer: {
    marginBottom: 12,
  },
  receiptImage: {
    width: "100%",
    height: 120,
    borderRadius: radius.medium,
  },
  noImageContainer: {
    width: "100%",
    height: 120,
    borderRadius: radius.medium,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  noImageIcon: {
    fontSize: 32,
  },
  receiptInfo: {
    alignItems: "center",
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  receiptCategory: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  receiptTag: {
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  // List Card Styles
  listCardContainer: {
    marginBottom: 12,
  },
  listCard: {
    flexDirection: "row",
    borderRadius: radius.large,
    padding: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  listImageContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.medium,
    overflow: "hidden",
    marginRight: 16,
  },
  listReceiptImage: {
    width: "100%",
    height: "100%",
  },
  listNoImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  listNoImageIcon: {
    fontSize: 24,
  },
  listCardDetails: {
    flex: 1,
  },
  listCardHeader: {
    marginBottom: 4,
  },
  listCardAmount: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  listCardCategory: {
    fontSize: 14,
    fontWeight: "600",
  },
  listCardTag: {
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
    marginBottom: 4,
  },
  listCardDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateIcon: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 24,
    marginBottom: 32,
  },
  addFirstButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.large,
  },
  addFirstButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
  },
  resetFiltersButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.medium,
  },
  resetFiltersText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalImageContainer: {
    marginBottom: 20,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: radius.medium,
  },
  modalNoImage: {
    width: "100%",
    height: 200,
    borderRadius: radius.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  modalNoImageIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalNoImageText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalDetails: {
    marginBottom: 24,
  },
  modalAmount: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalInfoItem: {
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  modalTagContainer: {
    marginBottom: 16,
  },
  modalTag: {
    fontSize: 16,
    fontWeight: "700",
    fontStyle: "italic",
  },
  modalNotesContainer: {
    marginBottom: 16,
  },
  modalNotes: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  editButton: {
    // backgroundColor set dynamically
  },
  deleteButton: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SavedReceipts;

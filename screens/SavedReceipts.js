import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
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
import { spacing, layout } from "../constants/spacing";
import { radius, borderRadius } from "../constants/radius";
import { typography, textStyles } from "../constants/typography";
import { elevation } from "../constants/shadows";
import { useCurrency } from "../context/CurrencyContext";
import { Picker } from "@react-native-picker/picker";
import { CategoryContext } from "../context/CategoryContext";

const { width: screenWidth } = Dimensions.get("window");

const SavedReceipts = forwardRef((props, ref) => {
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
  // Add filter state
  const [recurringFilter, setRecurringFilter] = useState("all"); // 'all', 'recurring', 'nonrecurring'

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();
  const isValidUri = (uri) =>
    (typeof uri === "string" && uri.startsWith("http")) ||
    uri.startsWith("file");

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(150, [
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
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
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
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {item.image && isValidUri(item.image) ? (
          <Image source={{ uri: item.image }} style={styles.receiptImage} />
        ) : (
          <View
            style={[
              styles.noImageContainer,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <Text style={styles.noImageIcon}>🧾</Text>
            <Text style={[styles.noImageText, { color: theme.subtleText }]}>
              No Image
            </Text>
          </View>
        )}
        <View style={styles.receiptInfo}>
          <Text style={[styles.receiptAmount, { color: theme.text }]}>
            {formatCurrency(convertCurrency(item.amount))}
          </Text>
          <Text style={[styles.receiptCategory, { color: theme.subtleText }]}>
            {item.category}
          </Text>
          {item.tag && (
            <Text style={[styles.receiptTag, { color: theme.success }]}>
              #{item.tag}
            </Text>
          )}
          {(item.isRecurring || item.recurrence) && (
            <View
              style={[
                styles.recurringCheck,
                { backgroundColor: "transparent" },
              ]}
            >
              <Text
                style={[
                  styles.recurringCheckMark,
                  { color: theme.accent || theme.primary },
                ]}
              >
                ✓
              </Text>
            </View>
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
    const recurringMatch =
      recurringFilter === "all"
        ? true
        : recurringFilter === "recurring"
        ? r.isRecurring || !!r.recurrence
        : !(r.isRecurring || !!r.recurrence);
    return tagMatch && categoryMatch && recurringMatch;
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
      <View
        style={[
          styles.emptyStateIconContainer,
          { backgroundColor: theme.primaryBg },
        ]}
      >
        <Text style={[styles.emptyStateIcon, { color: theme.primary }]}>
          📋
        </Text>
      </View>
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
        No receipts yet
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.subtleText }]}>
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
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Saved Receipts
        </Text>
        <Text style={[styles.subtitle, { color: theme.subtleText }]}>
          Track and manage your expenses
        </Text>
      </View>
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
          placeholderTextColor={theme.textMuted}
          value={searchTag}
          onChangeText={setSearchTag}
          style={[
            styles.searchInput,
            {
              borderColor: theme.border,
              backgroundColor: theme.surface,
              color: theme.text,
            },
          ]}
        />
      </View>

      {/* Category Filter */}
      <View
        style={[
          styles.pickerContainer,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={[styles.picker, { color: theme.textMuted }]}
        >
          <Picker.Item label="All Categories" value={null} />
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
    </Animated.View>
  );

  // Add recurring filter UI above receipts grid
  const renderRecurringFilter = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          recurringFilter === "all" && { backgroundColor: theme.primary },
        ]}
        onPress={() => setRecurringFilter("all")}
      >
        <Text
          style={[
            styles.filterButtonText,
            {
              color: recurringFilter === "all" ? theme.textInverse : theme.text,
            },
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          recurringFilter === "recurring" && { backgroundColor: theme.primary },
        ]}
        onPress={() => setRecurringFilter("recurring")}
      >
        <Text
          style={[
            styles.filterButtonText,
            {
              color:
                recurringFilter === "recurring"
                  ? theme.textInverse
                  : theme.text,
            },
          ]}
        >
          Recurring
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          recurringFilter === "nonrecurring" && {
            backgroundColor: theme.primary,
          },
        ]}
        onPress={() => setRecurringFilter("nonrecurring")}
      >
        <Text
          style={[
            styles.filterButtonText,
            {
              color:
                recurringFilter === "nonrecurring"
                  ? theme.textInverse
                  : theme.text,
            },
          ]}
        >
          Non-Recurring
        </Text>
      </TouchableOpacity>
    </View>
  );

  // SOLUTION 2: Use ScrollView instead of FlatList when dropdown is open
  if (categoryOpen) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentWithDropdown}
          >
            {renderHeader()}
            {renderSearchAndFilters()}
            {renderRecurringFilter()}

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
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        {item.image && isValidUri(item.image) ? (
                          <Image
                            source={{ uri: item.image }}
                            style={styles.receiptImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.noImageContainer,
                              {
                                backgroundColor: theme.surfaceSecondary,
                                borderColor: theme.borderLight,
                              },
                            ]}
                          >
                            <Text style={styles.noImageIcon}>🧾</Text>
                            <Text
                              style={[
                                styles.noImageText,
                                { color: theme.textMuted },
                              ]}
                            >
                              No Image
                            </Text>
                          </View>
                        )}
                        <View style={styles.receiptInfo}>
                          <Text
                            style={[
                              styles.receiptAmount,
                              { color: theme.text },
                            ]}
                          >
                            {formatCurrency(convertCurrency(item.amount))}
                          </Text>
                          <Text
                            style={[
                              styles.receiptCategory,
                              { color: theme.subtleText },
                            ]}
                          >
                            {item.category}
                          </Text>
                          {item.tag && (
                            <Text
                              style={[
                                styles.receiptTag,
                                { color: theme.success },
                              ]}
                            >
                              #{item.tag}
                            </Text>
                          )}
                          {(item.isRecurring || item.recurrence) && (
                            <View
                              style={[
                                styles.recurringCheck,
                                { backgroundColor: "transparent" },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.recurringCheckMark,
                                  { color: theme.accent || theme.primary },
                                ]}
                              >
                                ✓
                              </Text>
                            </View>
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
                  style={[styles.noResultsText, { color: theme.subtleText }]}
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
                    backgroundColor: theme.surface,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[
                    styles.closeButton,
                    { backgroundColor: theme.dangerBg },
                  ]}
                >
                  <Text style={[styles.closeText, { color: theme.danger }]}>
                    ×
                  </Text>
                </TouchableOpacity>

                {selectedReceipt && (
                  <>
                    {selectedReceipt.image ? (
                      <Image
                        source={{ uri: selectedReceipt.image }}
                        style={[
                          styles.modalImage,
                          { borderColor: theme.borderLight },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.modalNoImage,
                          {
                            backgroundColor: theme.primaryBg,
                            borderColor: theme.borderLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalNoImageIcon,
                            { color: theme.primary },
                          ]}
                        >
                          🧾
                        </Text>
                        <Text
                          style={[
                            styles.modalNoImageText,
                            { color: theme.textMuted },
                          ]}
                        >
                          Image not available
                        </Text>
                      </View>
                    )}

                    <View style={styles.modalInfo}>
                      <Text style={[styles.modalAmount, { color: theme.text }]}>
                        {formatCurrency(
                          convertCurrency(selectedReceipt.amount)
                        )}
                      </Text>
                      <Text
                        style={[
                          styles.modalCategory,
                          { color: theme.textMuted },
                        ]}
                      >
                        {selectedReceipt.category}
                      </Text>
                      <Text
                        style={[styles.modalTag, { color: theme.textMuted }]}
                      >
                        #{selectedReceipt.tag || "No tag"}
                      </Text>
                      {(selectedReceipt.isRecurring ||
                        selectedReceipt.recurrence) && (
                        <View style={styles.modalRecurringRow}>
                          <Text
                            style={[
                              styles.modalRecurringText,
                              { color: theme.accent || theme.primary },
                            ]}
                          >
                            Recurring
                          </Text>
                          {selectedReceipt.recurrence && (
                            <Text
                              style={[
                                styles.modalRecurringFreq,
                                { color: theme.textSecondary },
                              ]}
                            >
                              (
                              {selectedReceipt.recurrence
                                .charAt(0)
                                .toUpperCase() +
                                selectedReceipt.recurrence.slice(1)}
                              )
                            </Text>
                          )}
                        </View>
                      )}
                    </View>

                    <View style={styles.modalButtonRow}>
                      <TouchableOpacity
                        style={[
                          styles.editButton,
                          { backgroundColor: theme.primary },
                        ]}
                        onPress={() => {
                          setModalVisible(false);
                          navigation.navigate("Add Receipt", {
                            receiptToEdit: selectedReceipt,
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            { color: theme.textInverse },
                          ]}
                        >
                          Edit
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.deleteButton,
                          { backgroundColor: theme.danger },
                        ]}
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
                        <Text
                          style={[
                            styles.buttonText,
                            { color: theme.textInverse },
                          ]}
                        >
                          Delete
                        </Text>
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
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderHeader()}
            {renderEmptyState()}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        ) : (
          <View
            style={[styles.container, { backgroundColor: theme.background }]}
          >
            {/* Fixed Header and Filters */}
            <View style={styles.fixedHeader}>
              {renderHeader()}
              {renderSearchAndFilters()}
              {renderRecurringFilter()}
            </View>

            {/* FlatList for receipts */}
            <FlatList
              data={filteredReceipts}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              renderItem={renderItem}
              contentContainerStyle={styles.flatListContent}
              columnWrapperStyle={styles.gridRow}
              ListEmptyComponent={
                <View style={styles.noResultsContainer}>
                  <Text
                    style={[styles.noResultsText, { color: theme.subtleText }]}
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
                  backgroundColor: theme.surface,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.dangerBg },
                ]}
              >
                <Text style={[styles.closeText, { color: theme.danger }]}>
                  ×
                </Text>
              </TouchableOpacity>

              {selectedReceipt && (
                <>
                  {selectedReceipt.image ? (
                    <Image
                      source={{ uri: selectedReceipt.image }}
                      style={[
                        styles.modalImage,
                        { borderColor: theme.borderLight },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.modalNoImage,
                        {
                          backgroundColor: theme.primaryBg,
                          borderColor: theme.borderLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalNoImageIcon,
                          { color: theme.primary },
                        ]}
                      >
                        🧾
                      </Text>
                      <Text
                        style={[
                          styles.modalNoImageText,
                          { color: theme.textMuted },
                        ]}
                      >
                        Image not available
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalInfo}>
                    <Text style={[styles.modalAmount, { color: theme.text }]}>
                      {formatCurrency(convertCurrency(selectedReceipt.amount))}
                    </Text>
                    <Text
                      style={[styles.modalCategory, { color: theme.textMuted }]}
                    >
                      {selectedReceipt.category}
                    </Text>
                    <Text style={[styles.modalTag, { color: theme.textMuted }]}>
                      #{selectedReceipt.tag || "No tag"}
                    </Text>
                    {(selectedReceipt.isRecurring ||
                      selectedReceipt.recurrence) && (
                      <View style={styles.modalRecurringRow}>
                        <Text
                          style={[
                            styles.modalRecurringText,
                            { color: theme.accent || theme.primary },
                          ]}
                        >
                          Recurring
                        </Text>
                        {selectedReceipt.recurrence && (
                          <Text
                            style={[
                              styles.modalRecurringFreq,
                              { color: theme.textSecondary },
                            ]}
                          >
                            (
                            {selectedReceipt.recurrence
                              .charAt(0)
                              .toUpperCase() +
                              selectedReceipt.recurrence.slice(1)}
                            )
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        { backgroundColor: theme.primary },
                      ]}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate("Add Receipt", {
                          receiptToEdit: selectedReceipt,
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          { color: theme.textInverse },
                        ]}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        { backgroundColor: theme.danger },
                      ]}
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
                      <Text
                        style={[
                          styles.buttonText,
                          { color: theme.textInverse },
                        ]}
                      >
                        Delete
                      </Text>
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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  scrollContentWithDropdown: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 20,
  },
  fixedHeader: {
    backgroundColor: "transparent",
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: "center",
  },

  title: {
    fontSize: typography.display,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  headerTitle: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    marginBottom: spacing.xs, // Match other screens
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.base,
    fontWeight: typography.normal,
    textAlign: "center",
    lineHeight: typography.relaxed * typography.base,
    // No extra margin on top for compact look
  },
  filtersContainer: {
    paddingBottom: spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.avatar,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 28,
  },
  emptyStateTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: typography.relaxed * typography.sm,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.inputPadding,
    paddingVertical: spacing.md,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    minHeight: 55,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.input,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  picker: {
    height: 55,
  },
  receiptsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: spacing.md,
  },
  gridItemWrapper: {
    width: "30%",
    marginBottom: spacing.md,
  },
  flatListContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  gridRow: {
    justifyContent: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  receiptCard: {
    width: "100%",
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 1,
    position: "relative", // Ensure absolutely positioned children are relative to the card
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  receiptImage: {
    width: "100%",
    height: 80,
    borderRadius: borderRadius.card,
    marginBottom: spacing.sm,
  },
  noImageContainer: {
    width: "100%",
    height: 80,
    borderRadius: borderRadius.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  noImageIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  noImageText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  receiptInfo: {
    alignItems: "center",
  },
  receiptAmount: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    marginBottom: spacing.xs,
  },
  receiptCategory: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  receiptTag: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    fontStyle: "italic",
  },
  recurringBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  recurringBadgeText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    textAlign: "center",
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  noResultsText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  closeButton: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
  closeText: {
    fontSize: 22,
    fontWeight: typography.bold,
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  modalNoImage: {
    width: "100%",
    height: 180,
    borderRadius: borderRadius.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  modalNoImageIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  modalNoImageText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  modalInfo: {
    alignItems: "center",
    marginBottom: spacing.xl,
    width: "100%",
    paddingHorizontal: spacing.md,
  },
  modalAmount: {
    fontSize: typography.display,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  modalCategory: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  modalTag: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    fontStyle: "italic",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  editButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
    flex: 1,
    alignItems: "center",
    minHeight: 44,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  deleteButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
    flex: 1,
    alignItems: "center",
    minHeight: 44,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  modalRecurringRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
    gap: 6,
  },
  modalRecurringText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
  },
  modalRecurringFreq: {
    fontSize: typography.sm,
    fontWeight: typography.regular,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 2,
  },
  filterButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  recurringCheck: {
    position: "absolute",
    top: -102,
    left: -12,
    zIndex: 2,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  recurringCheckMark: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SavedReceipts;

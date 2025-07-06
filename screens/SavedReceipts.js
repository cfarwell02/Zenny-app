import React, { useContext, useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReceiptContext } from "../context/ReceiptContext";
import { BudgetContext } from "../context/BudgetContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import DropDownPicker from "react-native-dropdown-picker";
import { CategoryContext } from "../context/CategoryContext";

const SavedReceiptsScreen = () => {
  const { receipts, deleteReceipt } = useContext(ReceiptContext);
  const { darkMode } = useContext(ThemeContext);
  const { categories } = useContext(CategoryContext);
  const { categoryBudgets, updateCategoryBudget, removeExpense, expenses } =
    useContext(BudgetContext);
  const [searchTag, setSearchTag] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const theme = darkMode ? darkTheme : lightTheme;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const navigation = useNavigation();
  const isValidUri = (uri) =>
    (typeof uri === "string" && uri.startsWith("http")) ||
    uri.startsWith("file");

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

  useEffect(() => {
    console.log("📊 SavedReceiptsScreen - Current state:");
    console.log("📊 Receipts:", receipts);
    console.log("📊 CategoryBudgets:", categoryBudgets);
    console.log("📊 Expenses:", expenses);
  }, [receipts, categoryBudgets, expenses]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        console.log("🔍 Receipt item:", item);
        console.log("🔍 Receipt ID:", item.id, "Type:", typeof item.id);
        setSelectedReceipt(item);
        setModalVisible(true);
      }}
    >
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {item.image && isValidUri(item.image) ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.image,
              {
                backgroundColor: "#ccc",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text style={{ color: "black" }}>No Image</Text>
          </View>
        )}
        <Text style={{ color: theme.text }}>${item.amount.toFixed(2)}</Text>
        <Text style={{ color: theme.subtleText }}>{item.category}</Text>
        {item.tag ? (
          <Text style={[styles.tagText, { color: theme.accent }]}>
            #{item.tag}
          </Text>
        ) : null}
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
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["top", "left", "right"]}
      >
        {receipts.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🧾</Text>
            <Text
              style={{
                color: theme.text,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              No receipts yet
            </Text>
            <Text
              style={{
                color: theme.subtleText,
                fontSize: 14,
                textAlign: "center",
                maxWidth: 260,
                paddingHorizontal: 20,
                lineHeight: 20,
                marginBottom: 75,
              }}
            >
              When you add a receipt, it will show up here for easy tracking and
              filtering.
            </Text>
          </View>
        ) : (
          <>
            <TextInput
              placeholder="Search by tag..."
              placeholderTextColor={theme.placeholder}
              value={searchTag}
              onChangeText={setSearchTag}
              style={[
                styles.searchInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.input,
                },
              ]}
            />

            <View style={{ marginBottom: 16 }}>
              <DropDownPicker
                key={categories.join(",")}
                open={categoryOpen}
                value={selectedCategory}
                items={categoryItems}
                setOpen={setCategoryOpen}
                setValue={setSelectedCategory}
                setItems={setCategoryItems}
                placeholder="All Categories"
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                  keyboardShouldPersistTaps: "handled",
                  persistentScrollbar: true,
                }}
                onChangeValue={(value) => {
                  setSelectedCategory(value || null); // 👈 key fix
                }}
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.input,
                }}
                dropDownContainerStyle={{
                  borderColor: theme.border,
                  backgroundColor: theme.input,
                  maxHeight: 200,
                  zIndex: 1000, // Try an extremely high zIndex here
                  elevation: 1, // And a slightly higher elevation
                }}
                textStyle={{
                  color: theme.text,
                }}
                placeholderStyle={{
                  color: theme.placeholder,
                }}
              />
            </View>

            <FlatList
              data={filteredReceipts}
              keyExtractor={(item) => item.id.toString()}
              numColumns={4}
              renderItem={renderItem}
              contentContainerStyle={styles.grid}
              ListEmptyComponent={
                <Text
                  style={{
                    color: theme.subtleText,
                    textAlign: "center",
                    marginTop: 20,
                    fontSize: 16,
                  }}
                >
                  No matching receipts found.
                </Text>
              }
            />
          </>
        )}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
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
                    <Text style={{ color: "red", marginBottom: 12 }}>
                      Image not available
                    </Text>
                  )}
                  <Text style={{ color: theme.text }}>
                    Amount: ${selectedReceipt.amount}
                  </Text>
                  <Text style={{ color: theme.text }}>
                    Category: {selectedReceipt.category}
                  </Text>
                  <Text style={{ color: theme.accent }}>
                    Tag: {selectedReceipt.tag || "None"}
                  </Text>

                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate("Add Receipt", {
                          receiptToEdit: selectedReceipt,
                        });
                      }}
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
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
  },
  grid: {
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    flex: 1,
    margin: 6,
    padding: 8,
    borderRadius: radius.medium,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    maxWidth: 90,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 90,
    borderRadius: radius.small,
    marginBottom: 6,
  },
  tagText: {
    marginTop: 2,
    fontSize: 11,
    fontStyle: "italic",
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  modalCard: {
    width: "90%",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 1,
    padding: 4,
  },
  closeText: {
    fontSize: 36,
    color: "#FF3B30",
    fontWeight: "bold",
  },
});

export default SavedReceiptsScreen;

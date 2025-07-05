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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReceiptContext } from "../context/ReceiptContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import DropDownPicker from "react-native-dropdown-picker";
import { CategoryContext } from "../context/CategoryContext";

const SavedReceiptsScreen = () => {
  const { receipts } = useContext(ReceiptContext);
  const { darkMode } = useContext(ThemeContext);
  const { categories } = useContext(CategoryContext);
  const [searchTag, setSearchTag] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const theme = darkMode ? darkTheme : lightTheme;

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
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={{ color: theme.text }}>${item.amount.toFixed(2)}</Text>
      <Text style={{ color: theme.subtleText }}>{item.category}</Text>
      {item.tag ? (
        <Text style={[styles.tagText, { color: theme.accent }]}>
          #{item.tag}
        </Text>
      ) : null}
    </View>
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["top", "left", "right"]}
      >
        {receipts.length === 0 ? (
          <Text style={{ color: theme.text, textAlign: "center" }}>
            No receipts saved yet.
          </Text>
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
                  }}
                >
                  No matching receipts found.
                </Text>
              }
            />
          </>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  grid: {
    gap: 16,
    flexGrow: 1,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 125,
    borderRadius: radius.medium,
    marginBottom: 8,
  },
  tagText: {
    marginTop: 4,
    fontStyle: "italic",
    fontSize: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
});

export default SavedReceiptsScreen;

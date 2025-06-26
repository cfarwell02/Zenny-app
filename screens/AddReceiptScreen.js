import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { ReceiptContext } from "../context/ReceiptContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { BudgetContext } from "../context/BudgetContext";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext";
import { checkBudgetOverage } from "../utils/notifications";

const AddReceiptScreen = () => {
  const [image, setImage] = useState(null);
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([
    { label: "Food", value: "Food" },
    { label: "Shopping", value: "Shopping" },
    { label: "Transport", value: "Transport" },
    { label: "Bills", value: "Bills" },
    { label: "Other", value: "Other" },
  ]);

  const { addReceipt } = useContext(ReceiptContext);
  const { darkMode } = useContext(ThemeContext);
  const { budgets, expenses, addExpense } = useContext(BudgetContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { notificationsEnabled } = useContext(NotificationContext);

  const handleSaveReceipt = async () => {
    if (!image || !amount || !selectedCategory) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields before saving."
      );
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      Alert.alert("Invalid Input", "Please enter a valid number.");
      return;
    }

    const newReceipt = {
      id: Date.now(),
      image,
      amount: parseFloat(amount),
      category: selectedCategory,
      date: new Date().toISOString(),
    };

    const expense = {
      amount: Number(amount),
      category: selectedCategory,
      date: new Date().toISOString(),
    };

    try {
      addExpense(expense);
      addReceipt(newReceipt);
      console.log("✅ Expense and receipt added");
    } catch (error) {
      console.log("❌ Error adding expense or receipt:", error);
    }

    // 📊 Calculate budget stats
    const categoryExpenses = [...expenses, expense].filter(
      (e) => e.category === selectedCategory
    );
    const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

    const currentBudget = budgets.find((b) => b.category === selectedCategory);
    const budgetLimit = currentBudget?.amount;
    const percentSpent = budgetLimit ? (totalSpent / budgetLimit) * 100 : 0;
    console.log("🔸 percentSpent:", percentSpent);
    console.log("🔸 budgetLimit:", budgetLimit);
    console.log("🔸 threshold:", threshold);
    console.log("🔸 notificationsEnabled:", notificationsEnabled);

    if (
      notificationsEnabled &&
      budgetLimit &&
      threshold &&
      percentSpent > threshold
    ) {
      console.log("Sending Notification");
      Notifications.scheduleNotificationAsync({
        content: {
          title: "🧾 Receipt Saved",
          body: `Receipt for ${selectedCategory} saved successfully.`,
        },
        trigger: null,
      });
    }
    setImage(null);
    setAmount("");
    setSelectedCategory(null);
    Alert.alert("Success", "Receipt saved successfully!");
  };

  const handleInsertPhoto = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await takePhoto();
          if (buttonIndex === 2) await pickImage();
        }
      );
    } else {
      Alert.alert("Insert Photo", "Choose an option", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your camera.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={[
          styles.container,
          { backgroundColor: theme.background, flex: 1 },
        ]} // Add flex: 1 here
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inner}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>
              Add a Receipt
            </Text>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleInsertPhoto}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                📷 Insert Photo
              </Text>
            </TouchableOpacity>

            {image && (
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <Image source={{ uri: image }} style={styles.image} />

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.input,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Enter amount"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                <View style={styles.dropDownWrapper}>
                  <DropDownPicker
                    open={open}
                    value={selectedCategory}
                    items={categoryItems}
                    setOpen={setOpen}
                    setValue={setSelectedCategory}
                    setItems={setCategoryItems}
                    placeholder="Select a category..."
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.input,
                    }}
                    dropDownContainerStyle={{
                      borderColor: theme.border,
                      backgroundColor: theme.input,
                      zIndex: 1000,
                      position: "absolute",
                      top: Platform.OS === "android" ? 50 : 40,
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          {image && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.success }]}
              onPress={handleSaveReceipt}
            >
              <Text
                style={[styles.saveButtonText, { color: theme.buttonText }]}
              >
                💾 Save Receipt
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screen,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.betweenElements,
  },
  title: {
    fontSize: 24,
    marginBottom: spacing.betweenElements,
    textAlign: "center",
    marginTop: 50, // Adjusted for better spacing
  },
  button: {
    paddingVertical: 14,
    borderRadius: radius.medium,
    marginBottom: spacing.betweenElements,
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    padding: spacing.cardPadding,
    borderRadius: radius.large,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: radius.medium,
    marginBottom: spacing.betweenElements,
  },
  input: {
    borderWidth: 1,
    padding: spacing.inputPadding,
    borderRadius: radius.medium,
    fontSize: 16,
    marginBottom: spacing.betweenElements,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: radius.medium,
    marginTop: spacing.betweenElements,
    marginBottom: 70, // 👈 push the button higher
  },
  saveButtonText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  DropDownPicker: {
    position: "absolute",
  },
  dropDownWrapper: {
    zIndex: 10,
    marginBottom: spacing.betweenElements,
  },
});

export default AddReceiptScreen;

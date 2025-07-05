import React, { useState, useContext, useEffect } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { ReceiptContext } from "../context/ReceiptContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const AddReceiptScreen = () => {
  const [image, setImage] = useState(null);
  const [amount, setAmount] = useState("");
  const [tag, setTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { categories } = useContext(CategoryContext);
  const { addReceipt } = useContext(ReceiptContext);
  const { darkMode } = useContext(ThemeContext);
  const { categoryBudgets, threshold, expenses, addExpense } =
    useContext(BudgetContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { notificationsEnabled } = useContext(NotificationContext);

  useEffect(() => {
    // No need to format categories for Picker
  }, [categories]);

  const handleSaveReceipt = async () => {
    if (!amount || !selectedCategory) {
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
      amount: parsedAmount,
      category: selectedCategory,
      date: new Date().toISOString(),
      tag: tag.trim(),
    };

    const expense = {
      amount: parsedAmount,
      category: selectedCategory,
      date: new Date().toISOString(),
      tag: tag.trim(),
    };

    // Save the new expense and receipt
    addExpense(expense);
    addReceipt(newReceipt);

    try {
      const user = auth().currentUser;

      if (!user) {
        console.log("❌ No logged-in user found.");
        return;
      }

      await firestore().collection("receipts").add({
        user_id: user.uid,
        amount: parsedAmount,
        category: selectedCategory,
        date: new Date().toISOString(),
        image_url: image,
        tag: tag.trim(),
        created_at: firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Receipt saved to Firestore!");
    } catch (err) {
      console.error("⚠️ Firestore error:", err.message);
    }

    // Reset form
    setImage(null);
    setAmount("");
    setTag("");
    setSelectedCategory(null);
    Alert.alert("Success", "Receipt saved successfully!");

    // Calculate total spent for the category including this new expense
    const categoryExpenses = [...expenses, expense].filter(
      (e) => e.category === selectedCategory
    );
    const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

    const budgetLimit = categoryBudgets[selectedCategory];
    const percentSpent = budgetLimit ? (totalSpent / budgetLimit) * 100 : 0;

    console.log("📊 DEBUG:");
    console.log("Budget Limit:", budgetLimit);
    console.log("Threshold (%):", threshold);
    console.log("Total Spent:", totalSpent.toFixed(2));
    console.log("Percent Spent:", percentSpent.toFixed(2));

    if (budgetLimit && percentSpent > threshold && notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Budget Threshold Reached",
          body: `You've used ${percentSpent.toFixed(
            1
          )}% of your ${selectedCategory} budget.`,
          sound: true,
        },
        trigger: null,
      });
    }
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
        ]}
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
                <TextInput
                  placeholder="Add a tag (e.g., 'Lunch with Mom')"
                  value={tag}
                  onChangeText={setTag}
                  style={{
                    borderWidth: 1,
                    padding: 10,
                    marginBottom: 12,
                    borderRadius: 6,
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                  }}
                />

                <View
                  style={[
                    styles.pickerContainer,
                    { backgroundColor: theme.input, borderColor: theme.border },
                  ]}
                >
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) =>
                      setSelectedCategory(itemValue)
                    }
                    style={[styles.picker, { color: theme.text }]}
                  >
                    <Picker.Item label="Select a category..." value="" />
                    {categories.map((category) => (
                      <Picker.Item
                        key={category}
                        label={category}
                        value={category}
                      />
                    ))}
                  </Picker>
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: radius.medium,
    marginBottom: spacing.betweenElements,
  },
  picker: {
    height: 50,
  },
});

export default AddReceiptScreen;

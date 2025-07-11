import React, { useState, useContext, useEffect, useRef } from "react";
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
  ScrollView,
  Animated,
  Dimensions,
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
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

const AddReceiptScreen = () => {
  const [image, setImage] = useState(null);
  const [amount, setAmount] = useState("");
  const [tag, setTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { categories } = useContext(CategoryContext);
  const { addReceipt } = useContext(ReceiptContext);
  const { darkMode } = useContext(ThemeContext);
  const {
    categoryBudgets,
    threshold,
    expenses,
    setCategoryBudgets,
    saveBudgets,
  } = useContext(BudgetContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { notificationsEnabled } = useContext(NotificationContext);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

    setIsLoading(true);
    animateButton();

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

    // Save the new expense and receipt (await for persistence)
    await addReceipt(newReceipt);

    // Reset form
    setImage(null);
    setAmount("");
    setTag("");
    setSelectedCategory("");
    setIsLoading(false);

    Alert.alert("Success", "Receipt saved successfully!");

    // Calculate total spent for the category including this new expense
    const categoryExpenses = [...expenses, expense].filter(
      (e) => e.category === selectedCategory
    );
    const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Get the correct budget object for the selected category
    const budgetObj =
      categoryBudgets[selectedCategory] &&
      typeof categoryBudgets[selectedCategory] === "object"
        ? categoryBudgets[selectedCategory]
        : { amount: 0, threshold: 80, notified: false };
    const budgetLimit = budgetObj.amount;
    const thresholdValue = budgetObj.threshold;
    const percentSpent = budgetLimit ? (totalSpent / budgetLimit) * 100 : 0;

    // Debug logs
    // console.log("Budget Limit:", budgetLimit);
    // console.log("Threshold (%):", thresholdValue);
    // console.log("Total Spent:", totalSpent);
    // console.log("Percent Spent:", percentSpent);

    if (
      budgetLimit &&
      percentSpent >= thresholdValue &&
      notificationsEnabled &&
      !budgetObj.notified
    ) {
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
      // Mark as notified and persist
      const updatedBudget = {
        ...budgetObj,
        notified: true,
      };
      const updatedBudgets = {
        ...categoryBudgets,
        [selectedCategory]: updatedBudget,
      };
      setCategoryBudgets(updatedBudgets);
      if (typeof saveBudgets === "function") {
        await saveBudgets(updatedBudgets);
      }
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerIconContainer}>
              <Text style={styles.headerIcon}>📷</Text>
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              Add Receipt
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Capture and categorize your expenses
            </Text>
          </Animated.View>

          {/* Photo Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Receipt Photo
            </Text>

            {!image ? (
              <TouchableOpacity
                style={[
                  styles.photoPlaceholder,
                  {
                    backgroundColor: darkMode
                      ? theme.cardBackground
                      : "#F8F9FA",
                    borderColor: theme.border,
                  },
                ]}
                onPress={handleInsertPhoto}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.photoPlaceholderIcon,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.photoPlaceholderIconText}>📸</Text>
                </View>
                <Text
                  style={[styles.photoPlaceholderText, { color: theme.text }]}
                >
                  Add Photo
                </Text>
                <Text
                  style={[
                    styles.photoPlaceholderSubtext,
                    { color: theme.textSecondary },
                  ]}
                >
                  Take a photo or choose from library
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.photoContainer,
                  {
                    backgroundColor: darkMode
                      ? theme.cardBackground
                      : "#FFFFFF",
                  },
                ]}
              >
                <Image source={{ uri: image }} style={styles.receiptImage} />
                <TouchableOpacity
                  style={[
                    styles.changePhotoButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleInsertPhoto}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.changePhotoButtonText,
                      { color: theme.buttonText },
                    ]}
                  >
                    Change Photo
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Details Section */}
          {image && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Receipt Details
              </Text>

              <View
                style={[
                  styles.detailsCard,
                  {
                    backgroundColor: darkMode
                      ? theme.cardBackground
                      : "#FFFFFF",
                  },
                ]}
              >
                {/* Amount Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Amount *
                  </Text>
                  <View
                    style={[
                      styles.amountInputContainer,
                      {
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.currencySymbol, { color: theme.text }]}
                    >
                      $
                    </Text>
                    <TextInput
                      style={[styles.amountInput, { color: theme.text }]}
                      placeholder="0.00"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>
                </View>

                {/* Category Picker */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Category *
                  </Text>
                  <View
                    style={[
                      styles.pickerContainer,
                      {
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                      },
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

                {/* Tag Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Tag (Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.tagInput,
                      {
                        backgroundColor: theme.input,
                        borderColor: theme.border,
                        color: theme.text,
                      },
                    ]}
                    placeholder="e.g., Lunch with Mom"
                    placeholderTextColor={theme.textSecondary}
                    value={tag}
                    onChangeText={setTag}
                  />
                </View>
              </View>
            </Animated.View>
          )}

          {/* Save Button */}
          {image && (
            <Animated.View
              style={[
                styles.saveButtonContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: buttonScaleAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: theme.success,
                    opacity: isLoading ? 0.7 : 1,
                  },
                ]}
                onPress={handleSaveReceipt}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text
                  style={[styles.saveButtonText, { color: theme.buttonText }]}
                >
                  {isLoading ? "Saving..." : "💾 Save Receipt"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingTop: 20,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    marginLeft: 4,
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: radius.large,
    borderWidth: 2,
    borderStyle: "dashed",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  photoPlaceholderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  photoPlaceholderIconText: {
    fontSize: 24,
  },
  photoPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  photoPlaceholderSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  photoContainer: {
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
  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: radius.medium,
    marginBottom: 16,
  },
  changePhotoButton: {
    paddingVertical: 12,
    borderRadius: radius.medium,
    alignItems: "center",
  },
  changePhotoButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailsCard: {
    borderRadius: radius.large,
    padding: 20,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: radius.medium,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  tagInput: {
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButtonContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: radius.large,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
});

export default AddReceiptScreen;

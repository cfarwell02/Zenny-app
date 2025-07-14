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
import { IncomeContext } from "../context/IncomeContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing, layout } from "../constants/spacing";
import { radius, borderRadius } from "../constants/radius";
import { typography, textStyles } from "../constants/typography";
import { elevation } from "../constants/shadows";
import { BudgetContext } from "../context/BudgetContext";
import { CategoryContext } from "../context/CategoryContext";
import * as Notifications from "expo-notifications";
import { NotificationContext } from "../context/NotificationContext";
import { useCurrency } from "../context/CurrencyContext";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width: screenWidth } = Dimensions.get("window");

const AddReceiptScreen = ({ route }) => {
  const [image, setImage] = useState(null);
  const [amount, setAmount] = useState("");
  const [tag, setTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [mode, setMode] = useState("receipt"); // "receipt" or "income"
  const [source, setSource] = useState("");
  const [incomeType, setIncomeType] = useState("salary");
  const [includePhoto, setIncludePhoto] = useState(false);

  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState("monthly");
  const [recurrenceStart, setRecurrenceStart] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const { categories } = useContext(CategoryContext);
  const { addReceipt, updateReceipt } = useContext(ReceiptContext);
  const { addIncome } = useContext(IncomeContext);
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
  const { formatCurrency, convertCurrency } = useCurrency();

  // Animation refs
  const headerAnim = useRef(new Animated.Value(0)).current;
  const photoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(photoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle editing receipt
  useEffect(() => {
    if (route.params?.receiptToEdit) {
      const receipt = route.params.receiptToEdit;
      setEditingReceipt(receipt);
      setImage(receipt.image);
      setAmount(receipt.amount.toString());
      setTag(receipt.tag || "");
      setSelectedCategory(receipt.category);
    }
  }, [route.params?.receiptToEdit]);

  // Clear editing state when component unmounts
  useEffect(() => {
    return () => {
      setEditingReceipt(null);
    };
  }, []);

  const handleSaveReceipt = async () => {
    if (mode === "receipt") {
      if (!amount || !selectedCategory) {
        Alert.alert(
          "Missing Information",
          "Please fill in all required fields before saving."
        );
        return;
      }
    } else {
      if (!amount || !source) {
        Alert.alert(
          "Missing Information",
          "Please fill in amount and source before saving."
        );
        return;
      }
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    setIsLoading(true);

    if (editingReceipt) {
      // Update existing receipt
      const updatedReceipt = {
        image,
        amount: parsedAmount,
        category: selectedCategory,
        tag: tag.trim(),
      };

      await updateReceipt(editingReceipt.id, updatedReceipt);
      Alert.alert("Success", "Receipt updated successfully!");
    } else if (mode === "receipt") {
      // Add new receipt
      const newReceipt = {
        id: Date.now(),
        image,
        amount: parsedAmount,
        category: selectedCategory,
        date: new Date().toISOString(),
        tag: tag.trim(),
        // Add recurring fields
        isRecurring: isRecurring,
        recurrence: isRecurring ? recurrence : null,
        recurrenceStart: isRecurring ? recurrenceStart.toISOString() : null,
      };

      const expense = {
        amount: parsedAmount,
        category: selectedCategory,
        date: new Date().toISOString(),
        tag: tag.trim(),
      };

      // Save the new expense and receipt (await for persistence)
      await addReceipt(newReceipt);

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

      if (
        budgetLimit &&
        percentSpent >= thresholdValue &&
        notificationsEnabled
      ) {
        const remainingBudget = budgetLimit - totalSpent;
        const remainingFormatted = formatCurrency(
          convertCurrency(remainingBudget)
        );

        // Check notification permissions first
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          const { status: newStatus } =
            await Notifications.requestPermissionsAsync();
          if (newStatus !== "granted") {
            console.log("Notification permission denied");
            return;
          }
        }

        try {
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "⚠️ Budget Threshold Exceeded",
              body: `You have ${remainingFormatted} left in your ${selectedCategory} budget.`,
              sound: true,
              priority: "high",
              sticky: true, // Make notification persistent
            },
            trigger: {
              seconds: 1, // Send after 1 second to ensure it's properly scheduled
            },
          });

          console.log("Notification scheduled with ID:", notificationId);
        } catch (error) {
          console.error("Error scheduling notification:", error);
        }
      }
    } else {
      // Add new income
      const newIncome = {
        id: Date.now().toString(),
        source: source.trim(),
        amount: parsedAmount,
        type: incomeType,
        frequency: "monthly", // Default to monthly
        date: new Date().toISOString(),
      };

      await addIncome(newIncome);
      Alert.alert("Success", "Income saved successfully!");
    }

    // Reset form
    setImage(null);
    setAmount("");
    setTag("");
    setSource("");
    setSelectedCategory("");
    setIncomeType("salary");
    setEditingReceipt(null);
    setIsLoading(false);
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

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.headerContent}>
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
              fontSize: typography.xxxl,
              fontWeight: typography.bold,
            },
          ]}
        >
          {editingReceipt
            ? "Edit Receipt"
            : mode === "receipt"
            ? "Add Receipt"
            : "Add Income"}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {editingReceipt
            ? "Update your receipt details"
            : mode === "receipt"
            ? "Capture and categorize your expenses"
            : "Track your income sources"}
        </Text>
      </View>

      {!editingReceipt && (
        <View style={[styles.modeToggle, { backgroundColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "receipt" && [
                styles.modeButtonActive,
                { backgroundColor: theme.surface },
              ],
            ]}
            onPress={() => setMode("receipt")}
          >
            <Text
              style={[
                styles.modeButtonText,
                { color: theme.textSecondary },
                mode === "receipt" && [
                  styles.modeButtonTextActive,
                  { color: theme.primary },
                ],
              ]}
            >
              Receipt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === "income" && [
                styles.modeButtonActive,
                { backgroundColor: theme.surface },
              ],
            ]}
            onPress={() => setMode("income")}
          >
            <Text
              style={[
                styles.modeButtonText,
                { color: theme.textSecondary },
                mode === "income" && [
                  styles.modeButtonTextActive,
                  { color: theme.primary },
                ],
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderPhotoSection = () => (
    <Animated.View
      style={[
        styles.photoSection,
        {
          opacity: photoAnim,
          transform: [
            {
              translateY: photoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
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
              borderColor: theme.border,
              backgroundColor: theme.surface,
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
          <Text style={[styles.photoPlaceholderText, { color: theme.text }]}>
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
              backgroundColor: theme.surface,
              borderColor: theme.border,
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
            <Text style={styles.changePhotoButtonText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderFormSection = () => (
    <Animated.View
      style={[
        styles.formSection,
        {
          opacity: formAnim,
          transform: [
            {
              translateY: formAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {mode === "receipt" ? "Receipt Details" : "Income Details"}
      </Text>

      <View
        style={[
          styles.formCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
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
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
          >
            <Text
              style={[styles.currencySymbol, { color: theme.textSecondary }]}
            >
              $
            </Text>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* Recurring Toggle */}
        {mode === "receipt" && (
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsRecurring(!isRecurring)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  },
                  isRecurring && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
              >
                {isRecurring && <Text style={styles.checkboxText}>✓</Text>}
              </View>
              <Text
                style={[styles.checkboxLabel, { color: theme.textSecondary }]}
              >
                Recurring expense
              </Text>
            </TouchableOpacity>
            {isRecurring && (
              <View style={{ marginTop: spacing.sm }}>
                {/* Frequency Picker */}
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Frequency
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={recurrence}
                    onValueChange={setRecurrence}
                    style={[styles.picker, { color: theme.text }]}
                  >
                    <Picker.Item label="Monthly" value="monthly" />
                    <Picker.Item label="Weekly" value="weekly" />
                    <Picker.Item label="Yearly" value="yearly" />
                  </Picker>
                </View>
                {/* Start Date Picker */}
                <TouchableOpacity
                  style={{ marginTop: spacing.sm }}
                  onPress={() => setShowStartDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.inputLabel, { color: theme.textSecondary }]}
                  >
                    Start Date
                  </Text>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 16,
                      paddingVertical: 4,
                    }}
                  >
                    {recurrenceStart.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={recurrenceStart}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowStartDatePicker(false);
                      if (selectedDate) setRecurrenceStart(selectedDate);
                    }}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {mode === "receipt" && (
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIncludePhoto(!includePhoto)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  },
                  includePhoto && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
              >
                {includePhoto && <Text style={styles.checkboxText}>✓</Text>}
              </View>
              <Text
                style={[styles.checkboxLabel, { color: theme.textSecondary }]}
              >
                Include receipt photo
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === "receipt" ? (
          <>
            {/* Category Picker for Receipts */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Category *
              </Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(itemValue) => setSelectedCategory(itemValue)}
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

            {/* Tag Input for Receipts */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Tag (Optional)
              </Text>
              <TextInput
                style={[
                  styles.tagInput,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g., Lunch with Mom"
                placeholderTextColor={theme.textMuted}
                value={tag}
                onChangeText={setTag}
              />
            </View>
          </>
        ) : (
          <>
            {/* Source Input for Income */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Source *
              </Text>
              <TextInput
                style={[
                  styles.tagInput,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    color: theme.text,
                  },
                ]}
                placeholder="e.g., Salary, Freelance, Investment"
                placeholderTextColor={theme.textMuted}
                value={source}
                onChangeText={setSource}
              />
            </View>

            {/* Income Type Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Type
              </Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <Picker
                  selectedValue={incomeType}
                  onValueChange={(itemValue) => setIncomeType(itemValue)}
                  style={[styles.picker, { color: theme.text }]}
                >
                  <Picker.Item label="Salary" value="salary" />
                  <Picker.Item label="Freelance" value="freelance" />
                  <Picker.Item label="Investment" value="investment" />
                  <Picker.Item label="Business" value="business" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );

  const renderSaveButton = () => (
    <Animated.View
      style={[
        styles.saveButtonContainer,
        {
          opacity: buttonAnim,
          transform: [
            {
              translateY: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: theme.primary,
            opacity: isLoading ? 0.7 : 1,
          },
        ]}
        onPress={handleSaveReceipt}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isLoading
            ? "Saving..."
            : editingReceipt
            ? "💾 Update Receipt"
            : mode === "receipt"
            ? "💾 Save Receipt"
            : "💾 Save Income"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

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
          {renderHeader()}
          {mode === "receipt" && includePhoto && renderPhotoSection()}
          {renderFormSection()}
          {renderSaveButton()}
          <View style={styles.bottomSpacing} />
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
  subtitle: {
    fontSize: typography.base,
    fontWeight: typography.normal,
    textAlign: "center",
    lineHeight: typography.relaxed * typography.base,
  },
  photoSection: {
    marginBottom: spacing.lg,
  },
  photoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
  checkboxText: {
    fontSize: 12,
    fontWeight: typography.bold,
    color: "#FFFFFF",
  },
  checkboxLabel: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderStyle: "dashed",
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
  photoPlaceholderIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.avatar,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  photoPlaceholderIconText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  photoPlaceholderText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  photoPlaceholderSubtext: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    textAlign: "center",
    lineHeight: typography.relaxed * typography.sm,
  },
  photoContainer: {
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 1,
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
    height: 160,
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
  },
  changePhotoButton: {
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.button,
    alignItems: "center",
  },
  changePhotoButtonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: "#FFFFFF",
  },
  formCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    marginBottom: spacing.xs,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.inputPadding,
    paddingVertical: spacing.sm,
  },
  currencySymbol: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.input,
    overflow: "hidden",
  },
  picker: {
    height: 52,
  },
  tagInput: {
    borderWidth: 1,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.inputPadding,
    paddingVertical: spacing.md, // Increased from spacing.sm
    fontSize: typography.base, // Increased from typography.sm
  },
  saveButtonContainer: {
    marginBottom: spacing.lg,
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: "#FFFFFF",
  },
  modeToggle: {
    flexDirection: "row",
    borderRadius: borderRadius.button,
    padding: 4,
    marginTop: spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button - 4,
    alignItems: "center",
  },
  modeButtonActive: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  modeButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  modeButtonTextActive: {},
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default AddReceiptScreen;

import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import {
  DollarSign,
  TrendingUp,
  Plus,
  PieChart,
  Briefcase,
  Zap,
  Home,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Check,
  X,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { SafeAreaView } from "react-native-safe-area-context";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";

const { width } = Dimensions.get("window");

const IncomeScreen = () => {
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [incomeType, setIncomeType] = useState("salary");
  const [frequency, setFrequency] = useState("monthly");
  const [incomeList, setIncomeList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editSource, setEditSource] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

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

  const incomeTypeIcons = {
    salary: Briefcase,
    freelance: Zap,
    investment: TrendingUp,
    business: Home,
    other: DollarSign,
  };

  const incomeTypeColors = {
    salary: "#10b981",
    freelance: "#f59e0b",
    investment: "#3b82f6",
    business: "#8b5cf6",
    other: "#6b7280",
  };

  const formatCurrency = (amount) =>
    hideAmounts ? "••••" : `$${Math.round(amount).toLocaleString()}`;

  const validateAmount = (text) => {
    const numericValue = text.replace(/[^0-9.]/g, "");
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return numericValue;
  };

  const addIncome = () => {
    if (!amount.trim() || !source.trim()) {
      Alert.alert("Missing Info", "Please fill in all fields");
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }
    const newIncome = {
      id: Date.now().toString(),
      source: source.trim(),
      amount: numericAmount,
      type: incomeType,
      frequency,
      date: new Date().toISOString(),
    };
    setIncomeList([newIncome, ...incomeList]);
    setAmount("");
    setSource("");
    setShowAddModal(false);
    Alert.alert("🎉 Added!", "Your income was saved.");
  };

  const deleteIncome = (id) => {
    Alert.alert("Remove Entry", "Delete this income source?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setIncomeList(incomeList.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditAmount(item.amount.toString());
    setEditSource(item.source);
  };

  const saveEdit = () => {
    if (!editAmount.trim() || !editSource.trim()) return;
    const numericAmount = parseFloat(editAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    setIncomeList(
      incomeList.map((item) =>
        item.id === editingId
          ? { ...item, amount: numericAmount, source: editSource.trim() }
          : item
      )
    );
    setEditingId(null);
    setEditAmount("");
    setEditSource("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
    setEditSource("");
  };

  const calculateTotalIncome = (period = "monthly") => {
    return incomeList.reduce((sum, item) => {
      let convertedAmount = item.amount;
      if (period === "monthly") {
        if (item.frequency === "weekly") convertedAmount *= 4.33;
        if (item.frequency === "yearly") convertedAmount /= 12;
        if (item.frequency === "one-time") convertedAmount = 0;
      } else if (period === "yearly") {
        if (item.frequency === "weekly") convertedAmount *= 52;
        if (item.frequency === "monthly") convertedAmount *= 12;
        if (item.frequency === "one-time") convertedAmount = 0;
      } else if (period === "weekly") {
        if (item.frequency === "monthly") convertedAmount /= 4.33;
        if (item.frequency === "yearly") convertedAmount /= 52;
        if (item.frequency === "one-time") convertedAmount = 0;
      }
      return sum + convertedAmount;
    }, 0);
  };

  const getIncomeByType = () => {
    const typeStats = {};
    incomeList.forEach((item) => {
      if (!typeStats[item.type]) {
        typeStats[item.type] = { total: 0, count: 0 };
      }
      let convertedAmount = item.amount;
      if (item.frequency === "weekly") convertedAmount *= 4.33;
      if (item.frequency === "yearly") convertedAmount /= 12;
      typeStats[item.type].total += convertedAmount;
      typeStats[item.type].count += 1;
    });
    return typeStats;
  };

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
        Welcome to your
      </Text>
      <Text style={[styles.appName, { color: theme.text }]}>
        <Text style={styles.zennyAccent}>Income</Text>
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Track and manage your income sources
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
      <View style={styles.addCard}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Add Income Source
        </Text>

        <TextInput
          placeholder="Income source (e.g., Paycheck)"
          value={source}
          onChangeText={setSource}
          style={[
            styles.input,
            {
              borderColor: theme.textSecondary + "30",
              color: theme.text,
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
          placeholderTextColor={theme.textSecondary}
        />

        <TextInput
          placeholder="Amount ($)"
          value={amount}
          keyboardType="numeric"
          onChangeText={(text) => setAmount(validateAmount(text))}
          style={[
            styles.input,
            {
              borderColor: theme.textSecondary + "30",
              color: theme.text,
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
              shadowColor: theme.text,
            },
          ]}
          placeholderTextColor={theme.textSecondary}
        />

        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: "#4CAF50",
            },
          ]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>💼 Add Income</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderIncomeCard = (item) => {
    const Icon = incomeTypeIcons[item.type] || DollarSign;
    const isEditing = editingId === item.id;
    const iconColor = incomeTypeColors[item.type] || theme.primary;

    return (
      <View
        key={item.id}
        style={[
          styles.incomeCard,
          {
            backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
            shadowColor: theme.text,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.incomeInfo}>
            <View
              style={[styles.incomeIcon, { backgroundColor: iconColor + "20" }]}
            >
              <Icon color={iconColor} size={20} />
            </View>
            <View style={styles.incomeDetails}>
              <Text style={[styles.incomeSource, { color: theme.text }]}>
                {item.source}
              </Text>
              <Text style={[styles.incomeAmount, { color: "#4CAF50" }]}>
                {formatCurrency(item.amount)}
              </Text>
              <View style={styles.incomeMetadata}>
                <Text
                  style={[
                    styles.incomeFrequency,
                    { color: theme.textSecondary },
                  ]}
                >
                  {item.frequency}
                </Text>
                <Text
                  style={[styles.incomeDate, { color: theme.textSecondary }]}
                >
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => startEdit(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteIncome(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isEditing && (
          <View style={styles.editContainer}>
            <TextInput
              value={editSource}
              onChangeText={setEditSource}
              style={[
                styles.editInput,
                {
                  borderColor: theme.textSecondary + "30",
                  color: theme.text,
                  backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                },
              ]}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              value={editAmount}
              onChangeText={(text) => setEditAmount(validateAmount(text))}
              keyboardType="numeric"
              style={[
                styles.editInput,
                {
                  borderColor: theme.textSecondary + "30",
                  color: theme.text,
                  backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
                },
              ]}
              placeholderTextColor={theme.textSecondary}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveEdit}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={cancelEdit}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelEditButtonText}>✗</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.cardBackground}
      />
      <View
        style={[styles.bottomSheet, { backgroundColor: theme.cardBackground }]}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Add Income Source
          </Text>
        </View>

        <TextInput
          placeholder="e.g. Paycheck"
          placeholderTextColor={theme.textSecondary}
          value={source}
          onChangeText={setSource}
          style={[
            styles.inputField,
            {
              color: theme.text,
              borderColor: theme.textSecondary + "30",
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
            },
          ]}
        />

        <TextInput
          placeholder="Amount"
          placeholderTextColor={theme.textSecondary}
          value={amount}
          keyboardType="numeric"
          onChangeText={(text) => setAmount(validateAmount(text))}
          style={[
            styles.inputField,
            {
              color: theme.text,
              borderColor: theme.textSecondary + "30",
              backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
            },
          ]}
        />

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: "#4CAF50" }]}
          onPress={addIncome}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowAddModal(false)}
          style={styles.cancelButton}
        >
          <Text style={{ color: theme.textSecondary }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderStatsModal = () => {
    const typeStats = getIncomeByType();
    const totalIncome = calculateTotalIncome(selectedPeriod);

    return (
      <Modal
        visible={showStatsModal}
        animationType="slide"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={theme.cardBackground}
        />
        <View
          style={[
            styles.bottomSheet,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              📊 Income Summary ({selectedPeriod})
            </Text>
          </View>

          <View style={styles.totalIncomeContainer}>
            <Text
              style={[styles.totalIncomeLabel, { color: theme.textSecondary }]}
            >
              Total Income
            </Text>
            <Text style={[styles.totalIncomeAmount, { color: "#4CAF50" }]}>
              ${Math.round(totalIncome).toLocaleString()}
            </Text>
          </View>

          {Object.keys(typeStats).length === 0 ? (
            <View style={styles.emptyStats}>
              <Text
                style={[styles.emptyStatsText, { color: theme.textSecondary }]}
              >
                No income data available
              </Text>
            </View>
          ) : (
            <View style={styles.statsContainer}>
              {Object.entries(typeStats).map(([type, data]) => (
                <View key={type} style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.text }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    ${Math.round(data.total).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: "#4CAF50", marginTop: 20 },
            ]}
            onPress={() => setShowStatsModal(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowStatsModal(false)}
            style={styles.cancelButton}
          >
            <Text style={{ color: theme.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderAddSection()}

        <View style={styles.incomeContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Your Income Sources
          </Text>

          {incomeList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💼</Text>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No income sources yet
              </Text>
              <Text
                style={[styles.emptyStateText, { color: theme.textSecondary }]}
              >
                Add your first income source above to get started
              </Text>
            </View>
          ) : (
            incomeList.map((item) => renderIncomeCard(item))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderAddModal()}
      {renderStatsModal()}
    </SafeAreaView>
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
  addCard: {
    borderRadius: radius.large,
    padding: 24,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
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
  incomeContainer: {
    marginBottom: 24,
  },
  incomeCard: {
    borderRadius: radius.large,
    padding: 20,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  incomeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  incomeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  incomeDetails: {
    flex: 1,
  },
  incomeSource: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  incomeMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  incomeFrequency: {
    fontSize: 12,
    fontWeight: "500",
  },
  incomeDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.small,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  editContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  editInput: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.small,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    flex: 1,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelEditButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.small,
    backgroundColor: "#E74C3C",
    alignItems: "center",
    flex: 1,
  },
  cancelEditButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
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
  },
  bottomSheet: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputField: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: radius.medium,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
  },
  totalIncomeContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: radius.medium,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  totalIncomeLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  totalIncomeAmount: {
    fontSize: 24,
    fontWeight: "800",
  },
  emptyStats: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyStatsText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  statsContainer: {
    marginBottom: 20,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.small,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default IncomeScreen;

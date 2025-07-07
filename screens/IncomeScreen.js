import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Modal,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  DollarSign,
  TrendingUp,
  Plus,
  Target,
  Edit3,
  Trash2,
  Check,
  X,
  Briefcase,
  Zap,
  Home,
  Calendar,
  PieChart,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";

const { width } = Dimensions.get("window");

const IncomeScreen = () => {
  const { darkMode } = useContext(ThemeContext);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [incomeType, setIncomeType] = useState("salary");
  const [frequency, setFrequency] = useState("monthly");
  const [incomeList, setIncomeList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editSource, setEditSource] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const theme = darkMode ? darkTheme : lightTheme;

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

  const formatCurrency = (amount) => {
    if (hideAmounts) return "••••";
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const calculateTotalIncome = (period = "monthly") => {
    return incomeList.reduce((sum, item) => {
      let convertedAmount = item.amount;

      if (period === "monthly") {
        if (item.frequency === "weekly") convertedAmount = item.amount * 4.33;
        else if (item.frequency === "yearly")
          convertedAmount = item.amount / 12;
        else if (item.frequency === "one-time") convertedAmount = 0;
      } else if (period === "yearly") {
        if (item.frequency === "weekly") convertedAmount = item.amount * 52;
        else if (item.frequency === "monthly")
          convertedAmount = item.amount * 12;
        else if (item.frequency === "one-time") convertedAmount = 0;
      } else if (period === "weekly") {
        if (item.frequency === "monthly") convertedAmount = item.amount / 4.33;
        else if (item.frequency === "yearly")
          convertedAmount = item.amount / 52;
        else if (item.frequency === "one-time") convertedAmount = 0;
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
      if (item.frequency === "weekly") convertedAmount = item.amount * 4.33;
      else if (item.frequency === "yearly") convertedAmount = item.amount / 12;

      typeStats[item.type].total += convertedAmount;
      typeStats[item.type].count += 1;
    });
    return typeStats;
  };

  const validateAmount = (text) => {
    // Allow only numbers and decimal points
    const numericValue = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return numericValue;
  };

  const addIncome = () => {
    if (!amount.trim() || !source.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const newIncome = {
      id: Date.now().toString(),
      source: source.trim(),
      amount: numericAmount,
      type: incomeType,
      frequency: frequency,
      date: new Date().toISOString(),
    };

    setIncomeList([newIncome, ...incomeList]);
    setAmount("");
    setSource("");
    setShowAddModal(false);

    // Success feedback
    Alert.alert("Success", "Income added successfully!");
  };

  const deleteIncome = (id) => {
    Alert.alert(
      "Delete Income",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIncomeList(incomeList.filter((item) => item.id !== id));
            Alert.alert("Deleted", "Income entry removed");
          },
        },
      ]
    );
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditAmount(item.amount.toString());
    setEditSource(item.source);
  };

  const saveEdit = () => {
    if (!editAmount.trim() || !editSource.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const numericAmount = parseFloat(editAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

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
    Alert.alert("Success", "Income updated successfully!");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
    setEditSource("");
  };

  const renderStatsModal = () => {
    const typeStats = getIncomeByType();
    const totalMonthly = calculateTotalIncome("monthly");
    const totalYearly = calculateTotalIncome("yearly");

    return (
      <Modal
        visible={showStats}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStats(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.cardBg }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Income Statistics
              </Text>
              <TouchableOpacity onPress={() => setShowStats(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Total Monthly Income
                </Text>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {formatCurrency(totalMonthly)}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Total Yearly Income
                </Text>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {formatCurrency(totalYearly)}
                </Text>
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                By Income Type
              </Text>

              {Object.entries(typeStats).map(([type, stats]) => (
                <View key={type} style={styles.typeStatCard}>
                  <View style={styles.typeStatHeader}>
                    <View style={styles.typeStatIcon}>
                      {React.createElement(incomeTypeIcons[type], {
                        size: 20,
                        color: incomeTypeColors[type],
                      })}
                    </View>
                    <Text style={[styles.typeStatName, { color: theme.text }]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.typeStatDetails}>
                    <Text style={[styles.typeStatValue, { color: theme.text }]}>
                      {formatCurrency(stats.total)}
                    </Text>
                    <Text
                      style={[
                        styles.typeStatCount,
                        { color: theme.subtleText },
                      ]}
                    >
                      {stats.count} source{stats.count !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add Income Source
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.subtleText }]}>
                Source Name
              </Text>
              <TextInput
                placeholder="e.g., Main Job, Side Project"
                value={source}
                onChangeText={setSource}
                style={[
                  styles.modalInput,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.background,
                  },
                ]}
                placeholderTextColor={theme.subtleText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.subtleText }]}>
                Amount
              </Text>
              <TextInput
                placeholder="0.00"
                value={amount}
                onChangeText={(text) => setAmount(validateAmount(text))}
                keyboardType="numeric"
                style={[
                  styles.modalInput,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.background,
                  },
                ]}
                placeholderTextColor={theme.subtleText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.subtleText }]}>
                Income Type
              </Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <Picker
                  selectedValue={incomeType}
                  onValueChange={setIncomeType}
                  style={[styles.picker, { color: theme.text }]}
                >
                  <Picker.Item label="💼 Salary" value="salary" />
                  <Picker.Item label="⚡ Freelance" value="freelance" />
                  <Picker.Item label="📈 Investment" value="investment" />
                  <Picker.Item label="🏠 Business" value="business" />
                  <Picker.Item label="💰 Other" value="other" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.subtleText }]}>
                Frequency
              </Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  },
                ]}
              >
                <Picker
                  selectedValue={frequency}
                  onValueChange={setFrequency}
                  style={[styles.picker, { color: theme.text }]}
                >
                  <Picker.Item label="📅 Weekly" value="weekly" />
                  <Picker.Item label="🗓️ Monthly" value="monthly" />
                  <Picker.Item label="📆 Yearly" value="yearly" />
                  <Picker.Item label="🔄 One-time" value="one-time" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={addIncome}
            >
              <Plus size={20} color="white" />
              <Text style={styles.addButtonText}>Add Income</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Income Tracker
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtleText }]}>
            {incomeList.length} income source
            {incomeList.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.cardBg }]}
            onPress={() => setHideAmounts(!hideAmounts)}
          >
            {hideAmounts ? (
              <EyeOff size={20} color={theme.text} />
            ) : (
              <Eye size={20} color={theme.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.cardBg }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>
              Total{" "}
              {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}{" "}
              Income
            </Text>
            <TouchableOpacity onPress={() => setShowStats(true)}>
              <PieChart size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.summaryAmount, { color: theme.primary }]}>
            {formatCurrency(calculateTotalIncome(selectedPeriod))}
          </Text>
          <View style={styles.periodSelector}>
            {["weekly", "monthly", "yearly"].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    {
                      color:
                        selectedPeriod === period ? "white" : theme.subtleText,
                    },
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="white" />
          <Text style={styles.primaryButtonText}>Add Income</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.incomeList}
        showsVerticalScrollIndicator={false}
      >
        {incomeList.length === 0 ? (
          <View style={styles.emptyState}>
            <DollarSign size={48} color={theme.subtleText} />
            <Text style={[styles.emptyStateText, { color: theme.subtleText }]}>
              No income sources yet
            </Text>
            <Text
              style={[styles.emptyStateSubtext, { color: theme.subtleText }]}
            >
              Add your first income source to get started
            </Text>
          </View>
        ) : (
          incomeList.map((item) => {
            const Icon = incomeTypeIcons[item.type] || DollarSign;
            const isEditing = editingId === item.id;
            const iconColor = incomeTypeColors[item.type] || theme.primary;

            return (
              <View
                key={item.id}
                style={[
                  styles.incomeItem,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.incomeIcon,
                    { backgroundColor: iconColor + "20" },
                  ]}
                >
                  <Icon color={iconColor} size={20} />
                </View>

                {isEditing ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      value={editSource}
                      onChangeText={setEditSource}
                      style={[
                        styles.editInput,
                        {
                          borderColor: theme.border,
                          color: theme.text,
                          backgroundColor: theme.background,
                        },
                      ]}
                      placeholderTextColor={theme.subtleText}
                    />
                    <TextInput
                      value={editAmount}
                      onChangeText={(text) =>
                        setEditAmount(validateAmount(text))
                      }
                      style={[
                        styles.editInput,
                        {
                          borderColor: theme.border,
                          color: theme.text,
                          backgroundColor: theme.background,
                          width: 100,
                        },
                      ]}
                      keyboardType="numeric"
                      placeholderTextColor={theme.subtleText}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity
                        style={[
                          styles.editActionButton,
                          { backgroundColor: theme.primary },
                        ]}
                        onPress={saveEdit}
                      >
                        <Check size={16} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.editActionButton,
                          { backgroundColor: "#ef4444" },
                        ]}
                        onPress={cancelEdit}
                      >
                        <X size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.incomeDetails}>
                      <Text
                        style={[styles.incomeSource, { color: theme.text }]}
                      >
                        {item.source}
                      </Text>
                      <Text
                        style={[styles.incomeAmount, { color: theme.text }]}
                      >
                        {formatCurrency(item.amount)}
                      </Text>
                      <View style={styles.incomeMetadata}>
                        <Text
                          style={[
                            styles.incomeFrequency,
                            { color: theme.subtleText },
                          ]}
                        >
                          {item.frequency}
                        </Text>
                        <Text
                          style={[
                            styles.incomeDate,
                            { color: theme.subtleText },
                          ]}
                        >
                          {new Date(item.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.incomeActions}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: theme.primary + "20" },
                        ]}
                        onPress={() => startEdit(item)}
                      >
                        <Edit3 size={16} color={theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: "#ef444420" },
                        ]}
                        onPress={() => deleteIncome(item.id)}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {renderAddModal()}
      {renderStatsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  incomeList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  incomeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
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
    fontWeight: "600",
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  incomeMetadata: {
    flexDirection: "row",
    gap: 12,
  },
  incomeFrequency: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  incomeDate: {
    fontSize: 12,
  },
  incomeActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
  editContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  editActions: {
    flexDirection: "row",
    gap: 4,
  },
  editActionButton: {
    padding: 8,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: "80%",
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 10,
  },
  typeStatCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  typeStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  typeStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  typeStatName: {
    fontSize: 16,
    fontWeight: "500",
  },
  typeStatDetails: {
    alignItems: "flex-end",
  },
  typeStatValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  typeStatCount: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default IncomeScreen;

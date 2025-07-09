import React, { useState, useEffect, useContext } from "react";
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

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={[styles.bottomSheet, { backgroundColor: theme.cardBg }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Add Income
          </Text>
        </View>

        <TextInput
          placeholder="e.g. Paycheck"
          placeholderTextColor={theme.subtleText}
          value={source}
          onChangeText={setSource}
          style={[
            styles.inputField,
            { color: theme.text, borderColor: theme.border },
          ]}
        />

        <TextInput
          placeholder="Amount"
          placeholderTextColor={theme.subtleText}
          value={amount}
          keyboardType="numeric"
          onChangeText={(text) => setAmount(validateAmount(text))}
          style={[
            styles.inputField,
            { color: theme.text, borderColor: theme.border },
          ]}
        />

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={addIncome}
        >
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowAddModal(false)}
          style={styles.cancelButton}
        >
          <Text style={{ color: theme.subtleText }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderStatsModal = () => {
    const typeStats = getIncomeByType();
    const totalIncome = calculateTotalIncome(selectedPeriod);

    return (
      <Modal visible={showStatsModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.cardBg }]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              📊 Income Summary ({selectedPeriod})
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: theme.text, fontWeight: "bold" }}>
                Total: ${Math.round(totalIncome).toLocaleString()}
              </Text>
            </View>

            {Object.keys(typeStats).length === 0 ? (
              <Text style={{ color: theme.subtleText }}>
                No income data available
              </Text>
            ) : (
              Object.entries(typeStats).map(([type, data]) => (
                <View key={type} style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.text }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <Text style={{ color: theme.text }}>
                    ${Math.round(data.total).toLocaleString()}
                  </Text>
                </View>
              ))
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: theme.primary, marginTop: 20 },
              ]}
              onPress={() => setShowStatsModal(false)}
            >
              <Text style={{ color: "white" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // render and return remain mostly unchanged, only content tone and button labels adjusted for "Zenny" feel.

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={theme.background}
        />

        <ScrollView
          style={styles.incomeList}
          showsVerticalScrollIndicator={false}
        >
          {incomeList.length === 0 ? (
            <View style={styles.emptyState}>
              <DollarSign size={48} color={theme.subtleText} />
              <Text
                style={[styles.emptyStateText, { color: theme.subtleText }]}
              >
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
                        keyboardType="numeric"
                        style={[
                          styles.editInput,
                          {
                            borderColor: theme.border,
                            color: theme.text,
                            backgroundColor: theme.background,
                            width: 100,
                          },
                        ]}
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

        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus color="white" size={20} />
            <Text style={styles.addButtonText}>Add Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statsButton,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setShowStatsModal(true)}
          >
            <PieChart color={theme.primary} size={20} />
            <Text style={[styles.statsButtonText, { color: theme.primary }]}>
              Show Stats
            </Text>
          </TouchableOpacity>
        </View>

        {renderAddModal()}
        {renderStatsModal()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  incomeList: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  incomeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  incomeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  editContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 14,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  editActionButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  incomeDetails: {
    flex: 1,
  },
  incomeSource: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeAmount: {
    fontSize: 16,
    marginTop: 4,
  },
  incomeMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  incomeFrequency: {
    fontSize: 12,
  },
  incomeDate: {
    fontSize: 12,
  },
  incomeActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  confirmButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 14,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },

  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  statsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },

  statsButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
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
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },

  primaryButton: {
    paddingVertical: 12,
    borderRadius: 10,
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
});

export default IncomeScreen;

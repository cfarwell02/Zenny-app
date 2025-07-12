import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Alert,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { DataContext } from "../context/DataContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacing";
import { useCurrency } from "../context/CurrencyContext";

const { width } = Dimensions.get("window");

const SavingsGoalScreen = () => {
  const { darkMode } = useContext(ThemeContext);
  const { userData, saveGoals } = useContext(DataContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const { formatCurrency: formatCurrencyWithContext } = useCurrency();

  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  // Sync with DataContext
  useEffect(() => {
    setGoals(userData.goals || []);
  }, [userData.goals]);

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

  const addGoal = async () => {
    if (!goalName || !goalAmount || !savedAmount) return;
    const newGoal = {
      id: Date.now().toString(),
      name: goalName,
      goal: parseFloat(goalAmount),
      saved: parseFloat(savedAmount),
    };
    const updatedGoals = [newGoal, ...goals];
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
    setGoalName("");
    setGoalAmount("");
    setSavedAmount("");
    setShowAddModal(false);
  };

  const adjustSavedAmount = async (goalId, amount) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === goalId
        ? { ...goal, saved: Math.max(0, goal.saved + amount) }
        : goal
    );
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
  };

  const handleCustomAdjustment = async () => {
    if (!customAmount || !selectedGoalId) return;
    const amount = parseFloat(customAmount);
    if (isNaN(amount)) return;

    await adjustSavedAmount(selectedGoalId, amount);
    setCustomAmount("");
    setSelectedGoalId(null);
    setShowCustomModal(false);
  };

  const deleteGoal = (goalId) => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this savings goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedGoals = goals.filter((goal) => goal.id !== goalId);
            setGoals(updatedGoals);
            await saveGoals(updatedGoals);
          },
        },
      ]
    );
  };

  const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;

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
      <View style={styles.headerTop}>
        <Text style={[styles.appName, { color: theme.text }]}>
          <Text style={styles.zennyAccent}>Savings Goals</Text>
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.subtitle, { color: theme.subtleText }]}>
        Track your progress towards financial goals
      </Text>
    </Animated.View>
  );

  const renderGoalCard = (goal) => {
    const progress = Math.min(goal.saved / goal.goal, 1);
    const progressPct = Math.round(progress * 100);
    const remaining = goal.goal - goal.saved;

    return (
      <View
        key={goal.id}
        style={[
          styles.goalCard,
          {
            backgroundColor: darkMode ? theme.cardBackground : "#FFFFFF",
            shadowColor: theme.text,
          },
        ]}
      >
        <View style={styles.goalHeader}>
          <Text style={[styles.goalTitle, { color: theme.text }]}>
            {goal.name}
          </Text>
          <View style={styles.headerRight}>
            <View
              style={[
                styles.progressBadge,
                {
                  backgroundColor:
                    progressPct >= 100
                      ? "#4CAF50"
                      : progressPct >= 70
                      ? "#FF9800"
                      : "#2196F3",
                },
              ]}
            >
              <Text style={styles.progressBadgeText}>{progressPct}%</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteGoal(goal.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: theme.subtleText }]}>
              Saved
            </Text>
            <Text style={[styles.amountValue, { color: "#4CAF50" }]}>
              {formatCurrency(goal.saved)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: theme.subtleText }]}>
              Goal
            </Text>
            <Text style={[styles.amountValue, { color: theme.text }]}>
              {formatCurrency(goal.goal)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={[styles.amountLabel, { color: theme.subtleText }]}>
              Remaining
            </Text>
            <Text
              style={[
                styles.amountValue,
                { color: remaining >= 0 ? "#FF9800" : "#E74C3C" },
              ]}
            >
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.textSecondary + "20" },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor:
                    progressPct >= 100
                      ? "#4CAF50"
                      : progressPct >= 70
                      ? "#FF9800"
                      : "#2196F3",
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={[styles.quickActionsTitle, { color: theme.subtleText }]}>
            Quick Adjustments
          </Text>
          <View style={styles.quickButtonsRow}>
            {[10, 25, 50].map((amt) => (
              <TouchableOpacity
                key={`plus-${amt}`}
                style={[styles.quickButton, { borderColor: "#4CAF50" }]}
                onPress={() => adjustSavedAmount(goal.id, amt)}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickButtonText, { color: "#4CAF50" }]}>
                  +${amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.quickButtonsRow}>
            {[10, 25, 50].map((amt) => (
              <TouchableOpacity
                key={`minus-${amt}`}
                style={[styles.quickButton, { borderColor: "#E74C3C" }]}
                onPress={() => adjustSavedAmount(goal.id, -amt)}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickButtonText, { color: "#E74C3C" }]}>
                  -${amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity
              style={[styles.customButton, { borderColor: theme.primary }]}
              onPress={() => {
                setSelectedGoalId(goal.id);
                setShowCustomModal(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.customButtonText, { color: theme.primary }]}>
                Custom Amount
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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

        <View style={styles.goalsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Your Goals
          </Text>

          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎯</Text>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No goals yet
              </Text>
              <Text
                style={[styles.emptyStateText, { color: theme.subtleText }]}
              >
                Add your first savings goal using the + button above
              </Text>
            </View>
          ) : (
            goals.map((goal) => renderGoalCard(goal))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={darkMode ? "#000000" : "#FFFFFF"}
        />
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: darkMode ? "#000000" : "#FFFFFF" },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add New Goal
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeText, { color: theme.danger }]}>×</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Goal name (e.g., Vacation)"
            value={goalName}
            onChangeText={setGoalName}
            style={[
              styles.modalInput,
              {
                borderColor: theme.subtleText + "30",
                color: theme.text,
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
              },
            ]}
            placeholderTextColor={theme.subtleText}
          />

          <TextInput
            placeholder="Target Amount ($)"
            value={goalAmount}
            onChangeText={setGoalAmount}
            keyboardType="numeric"
            style={[
              styles.modalInput,
              {
                borderColor: theme.subtleText + "30",
                color: theme.text,
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
              },
            ]}
            placeholderTextColor={theme.subtleText}
          />

          <TextInput
            placeholder="Amount Already Saved ($)"
            value={savedAmount}
            onChangeText={setSavedAmount}
            keyboardType="numeric"
            style={[
              styles.modalInput,
              {
                borderColor: theme.subtleText + "30",
                color: theme.text,
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
              },
            ]}
            placeholderTextColor={theme.subtleText}
          />

          <TouchableOpacity
            style={[styles.modalAddButton, { backgroundColor: "#4CAF50" }]}
            onPress={addGoal}
            activeOpacity={0.8}
          >
            <Text style={styles.modalAddButtonText}>🎯 Add Goal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowAddModal(false)}
            style={styles.modalCancelButton}
          >
            <Text style={{ color: theme.subtleText }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Custom Amount Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={darkMode ? "#000000" : "#FFFFFF"}
        />
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: darkMode ? "#000000" : "#FFFFFF" },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Custom Adjustment
            </Text>
            <TouchableOpacity
              onPress={() => setShowCustomModal(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeText, { color: theme.danger }]}>×</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Enter amount (e.g., 75.50)"
            value={customAmount}
            onChangeText={setCustomAmount}
            keyboardType="numeric"
            style={[
              styles.modalInput,
              {
                borderColor: theme.subtleText + "30",
                color: theme.text,
                backgroundColor: darkMode ? "#000000" : "#FFFFFF",
              },
            ]}
            placeholderTextColor={theme.subtleText}
          />

          <View style={styles.customButtonsRow}>
            <TouchableOpacity
              style={[styles.customModalButton, { backgroundColor: "#4CAF50" }]}
              onPress={() => {
                if (customAmount) {
                  handleCustomAdjustment();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.customModalButtonText}>Add Amount</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customModalButton, { backgroundColor: "#E74C3C" }]}
              onPress={() => {
                if (customAmount) {
                  setCustomAmount("-" + customAmount);
                  setTimeout(() => handleCustomAdjustment(), 100);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.customModalButtonText}>Subtract Amount</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowCustomModal(false)}
            style={styles.modalCancelButton}
          >
            <Text style={{ color: theme.subtleText }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingVertical: 24,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  goalsContainer: {
    marginBottom: 24,
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.small,
    backgroundColor: "#FF3B30",
  },
  deleteButtonText: {
    fontSize: 16,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  amountItem: {
    alignItems: "center",
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  quickActions: {
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  quickButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  quickButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.small,
    borderWidth: 1,
    minWidth: 60,
    alignItems: "center",
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  customButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.small,
    borderWidth: 1,
    minWidth: 120,
    alignItems: "center",
  },
  customButtonText: {
    fontSize: 12,
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
  bottomSpacing: {
    height: 40,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: 16,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  modalAddButton: {
    paddingVertical: 16,
    borderRadius: radius.medium,
    alignItems: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  modalAddButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalCancelButton: {
    marginTop: 16,
    alignItems: "center",
  },
  customButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  customModalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.medium,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  customModalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default SavingsGoalScreen;

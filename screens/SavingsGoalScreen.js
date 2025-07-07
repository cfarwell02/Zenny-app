import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import {
  Calendar,
  Target,
  TrendingUp,
  Plus,
  Minus,
  Edit3,
  Share2,
  Clock,
  DollarSign,
  Zap,
  Award,
  PiggyBank,
  Settings,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  History,
  Calculator,
  Lightbulb,
  ArrowUp,
  ArrowDown,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";

const { width } = Dimensions.get("window");

const SavingsGoalScreen = () => {
  const { darkMode } = useContext(ThemeContext);
  const [goalAmount, setGoalAmount] = useState("5000");
  const [savedAmount, setSavedAmount] = useState("1250");
  const [goalName, setGoalName] = useState("Dream Vacation");
  const [targetDate, setTargetDate] = useState("2025-12-31");
  const [monthlyIncome, setMonthlyIncome] = useState("4500");
  const [monthlyExpenses, setMonthlyExpenses] = useState("3200");
  const [currentBalance, setCurrentBalance] = useState("8750");
  const [category, setCategory] = useState("vacation");
  const [isOnTrack, setIsOnTrack] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [contributionHistory, setContributionHistory] = useState([
    {
      id: 1,
      amount: 250,
      date: "2025-01-01",
      type: "deposit",
      note: "Monthly savings",
    },
    {
      id: 2,
      amount: 100,
      date: "2025-01-15",
      type: "deposit",
      note: "Bonus money",
    },
    {
      id: 3,
      amount: 50,
      date: "2025-01-20",
      type: "withdrawal",
      note: "Emergency expense",
    },
    {
      id: 4,
      amount: 200,
      date: "2025-02-01",
      type: "deposit",
      note: "Monthly savings",
    },
    {
      id: 5,
      amount: 300,
      date: "2025-02-15",
      type: "deposit",
      note: "Tax refund",
    },
  ]);
  const [autoSaveSettings, setAutoSaveSettings] = useState({
    enabled: false,
    amount: 100,
    frequency: "weekly", // weekly, biweekly, monthly
  });

  const theme = darkMode ? darkTheme : lightTheme;

  const parsedGoal = parseFloat(goalAmount) || 0;
  const parsedSaved = parseFloat(savedAmount) || 0;
  const parsedIncome = parseFloat(monthlyIncome) || 0;
  const parsedExpenses = parseFloat(monthlyExpenses) || 0;
  const parsedBalance = parseFloat(currentBalance) || 0;

  const progress = parsedGoal > 0 ? Math.min(parsedSaved / parsedGoal, 1) : 0;
  const remaining = Math.max(parsedGoal - parsedSaved, 0);
  const disposableIncome = parsedIncome - parsedExpenses;

  const today = new Date();
  const target = new Date(targetDate);
  const daysRemaining = Math.max(
    0,
    Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  );
  const monthsRemaining = Math.max(1, daysRemaining / 30);
  const monthlyTarget = remaining / monthsRemaining;

  // Calculate if user is on track
  const requiredSavingsRate = monthlyTarget / disposableIncome;
  const currentSavingsRate = monthlyTarget / parsedIncome;

  useEffect(() => {
    setIsOnTrack(requiredSavingsRate <= 0.3); // 30% of disposable income is reasonable
  }, [requiredSavingsRate]);

  const formatCurrency = (amount) => {
    return `$${Math.round(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const addContribution = (amount, note = "") => {
    const newContribution = {
      id: Date.now(),
      amount: Math.abs(amount),
      date: new Date().toISOString().split("T")[0],
      type: amount > 0 ? "deposit" : "withdrawal",
      note: note || (amount > 0 ? "Manual deposit" : "Manual withdrawal"),
    };

    setContributionHistory((prev) => [newContribution, ...prev]);
    setSavedAmount((parseFloat(savedAmount) + amount).toString());
  };

  const calculateOptimalSavings = () => {
    const scenarios = [
      {
        name: "Conservative (10%)",
        monthlyAmount: disposableIncome * 0.1,
        timeToGoal: remaining / (disposableIncome * 0.1),
        feasibility: "Easy",
      },
      {
        name: "Moderate (20%)",
        monthlyAmount: disposableIncome * 0.2,
        timeToGoal: remaining / (disposableIncome * 0.2),
        feasibility: "Manageable",
      },
      {
        name: "Aggressive (30%)",
        monthlyAmount: disposableIncome * 0.3,
        timeToGoal: remaining / (disposableIncome * 0.3),
        feasibility: "Challenging",
      },
      {
        name: "Required for Goal",
        monthlyAmount: monthlyTarget,
        timeToGoal: monthsRemaining,
        feasibility: isOnTrack ? "Achievable" : "Difficult",
      },
    ];
    return scenarios;
  };

  const getPersonalizedTips = () => {
    const tips = [];

    if (requiredSavingsRate > 0.3) {
      tips.push(
        "Your goal is ambitious! Consider extending the timeline or reducing expenses."
      );
    }

    if (disposableIncome > monthlyTarget * 2) {
      tips.push(
        "You have room to save more! Consider increasing your monthly target."
      );
    }

    if (parsedBalance < parsedGoal * 0.1) {
      tips.push("Build an emergency fund first to avoid dipping into savings.");
    }

    const daysSinceLastContribution =
      contributionHistory.length > 0
        ? Math.floor(
            (Date.now() - new Date(contributionHistory[0].date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

    if (daysSinceLastContribution > 14) {
      tips.push(
        "It's been a while since your last contribution. Small, regular amounts work best!"
      );
    }

    if (category === "emergency" && parsedSaved < parsedExpenses * 3) {
      tips.push("For emergency funds, aim for 3-6 months of expenses.");
    }

    return tips;
  };

  const quickAmounts = [
    Math.round(disposableIncome * 0.05), // 5% of disposable income
    Math.round(disposableIncome * 0.1), // 10% of disposable income
    Math.round(monthlyTarget * 0.5), // Half of monthly target
    Math.round(monthlyTarget), // Full monthly target
    Math.round(monthlyTarget * 1.5), // 150% of monthly target
  ].filter((amount) => amount > 0);

  const CalculatorModal = () => {
    const [calcGoal, setCalcGoal] = useState(goalAmount);
    const [calcTimeline, setCalcTimeline] = useState("12");
    const [calcMonthlyBudget, setCalcMonthlyBudget] = useState("");

    const scenarios = calculateOptimalSavings();

    return (
      <Modal
        visible={showCalculatorModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.fullModal, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Savings Calculator
              </Text>
              <TouchableOpacity onPress={() => setShowCalculatorModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Savings Scenarios
              </Text>

              {scenarios.map((scenario, index) => (
                <View
                  key={index}
                  style={[
                    styles.scenarioCard,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.scenarioHeader}>
                    <Text style={[styles.scenarioName, { color: theme.text }]}>
                      {scenario.name}
                    </Text>
                    <Text
                      style={[
                        styles.scenarioFeasibility,
                        {
                          color:
                            scenario.feasibility === "Easy"
                              ? theme.success
                              : scenario.feasibility === "Difficult"
                              ? theme.danger
                              : theme.warning,
                        },
                      ]}
                    >
                      {scenario.feasibility}
                    </Text>
                  </View>
                  <Text
                    style={[styles.scenarioAmount, { color: theme.primary }]}
                  >
                    {formatCurrency(scenario.monthlyAmount)}/month
                  </Text>
                  <Text
                    style={[styles.scenarioTime, { color: theme.subtleText }]}
                  >
                    Goal reached in {Math.ceil(scenario.timeToGoal)} months
                  </Text>
                </View>
              ))}

              <View style={styles.tipSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  💡 Personalized Tips
                </Text>
                {getPersonalizedTips().map((tip, index) => (
                  <Text
                    key={index}
                    style={[styles.tipText, { color: theme.subtleText }]}
                  >
                    • {tip}
                  </Text>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const HistoryModal = () => {
    const totalDeposits = contributionHistory
      .filter((item) => item.type === "deposit")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalWithdrawals = contributionHistory
      .filter((item) => item.type === "withdrawal")
      .reduce((sum, item) => sum + item.amount, 0);

    return (
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.fullModal, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Transaction History
              </Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.historyStats}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.success }]}>
                  {formatCurrency(totalDeposits)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Total Deposits
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.danger }]}>
                  {formatCurrency(totalWithdrawals)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Total Withdrawals
                </Text>
              </View>
            </View>

            <FlatList
              data={contributionHistory}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View
                  style={[styles.historyItem, { borderColor: theme.border }]}
                >
                  <View style={styles.historyLeft}>
                    <View
                      style={[
                        styles.historyIcon,
                        {
                          backgroundColor:
                            item.type === "deposit"
                              ? theme.success
                              : theme.danger,
                        },
                      ]}
                    >
                      {item.type === "deposit" ? (
                        <ArrowUp size={16} color="white" />
                      ) : (
                        <ArrowDown size={16} color="white" />
                      )}
                    </View>
                    <View>
                      <Text
                        style={[styles.historyAmount, { color: theme.text }]}
                      >
                        {item.type === "deposit" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text
                        style={[
                          styles.historyNote,
                          { color: theme.subtleText },
                        ]}
                      >
                        {item.note}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[styles.historyDate, { color: theme.subtleText }]}
                  >
                    {formatDate(item.date)}
                  </Text>
                </View>
              )}
              style={styles.historyList}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ backgroundColor: theme.background }}>
        <View style={styles.container}>
          {/* Header with Status */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.text }]}>
                {goalName}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isOnTrack
                        ? theme.success
                        : theme.warning,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {isOnTrack ? "On Track" : "Behind Schedule"}
                  </Text>
                </View>
                <Text style={[styles.subtitle, { color: theme.subtleText }]}>
                  {formatCurrency(parsedBalance)} available
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowEditModal(true)}>
              <Edit3 size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Progress Card */}
          <View
            style={[
              styles.progressCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <View style={styles.progressHeader}>
              <Text style={[styles.savedAmount, { color: theme.text }]}>
                {formatCurrency(parsedSaved)}
              </Text>
              <Text style={[styles.goalAmount, { color: theme.subtleText }]}>
                of {formatCurrency(parsedGoal)} • {Math.round(progress * 100)}%
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: theme.success,
                  },
                ]}
              />
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {formatCurrency(remaining)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Remaining
                </Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {formatCurrency(monthlyTarget)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Monthly Target
                </Text>
              </View>
              <View style={styles.progressStat}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {daysRemaining}
                </Text>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Days Left
                </Text>
              </View>
            </View>
          </View>

          {/* Smart Suggestions */}
          <View
            style={[
              styles.suggestionCard,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <View style={styles.suggestionHeader}>
              <Lightbulb size={20} color={theme.primary} />
              <Text style={[styles.suggestionTitle, { color: theme.text }]}>
                Smart Suggestion
              </Text>
            </View>
            <Text style={[styles.suggestionText, { color: theme.subtleText }]}>
              {isOnTrack
                ? `You're doing great! Save ${formatCurrency(
                    monthlyTarget
                  )} monthly to reach your goal.`
                : `To get back on track, try saving ${formatCurrency(
                    monthlyTarget * 1.2
                  )} this month.`}
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              onPress={() => setShowCalculatorModal(true)}
            >
              <Calculator size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>
                Calculator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              onPress={() => setShowHistoryModal(true)}
            >
              <History size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>
                History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              onPress={() =>
                Alert.alert(
                  "Auto-Save",
                  "Set up automatic transfers to reach your goal faster!"
                )
              }
            >
              <Zap size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>
                Auto-Save
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              onPress={() =>
                Alert.alert(
                  "Share",
                  "Share your progress with friends and family!"
                )
              }
            >
              <Share2 size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Add Amounts */}
          <View style={styles.quickAddSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick Add
            </Text>
            <View style={styles.quickButtonsRow}>
              {quickAmounts.map((amount, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickButton,
                    {
                      backgroundColor: theme.success,
                      borderColor: theme.success,
                    },
                  ]}
                  onPress={() => addContribution(amount)}
                >
                  <Text style={[styles.quickButtonText, { color: "white" }]}>
                    +{formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <CalculatorModal />
      <HistoryModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
  },
  progressCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  savedAmount: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  suggestionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  quickAddSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  quickButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: (width - 64) / 3,
    alignItems: "center",
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  fullModal: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  scenarioCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  scenarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: "600",
  },
  scenarioFeasibility: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  scenarioAmount: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  scenarioTime: {
    fontSize: 14,
  },
  tipSection: {
    marginTop: 20,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  historyStats: {
    flexDirection: "row",
    padding: 20,
    gap: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  historyNote: {
    fontSize: 12,
  },
  historyDate: {
    fontSize: 12,
  },
});

export default SavingsGoalScreen;

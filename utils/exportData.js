import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

// Format date for export
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

// Format currency for export
const formatCurrency = (amount, currency = "USD") => {
  if (amount === null || amount === undefined) return "";
  return parseFloat(amount).toFixed(2);
};

// Convert receipts to CSV format
const receiptsToCSV = (receipts, currency) => {
  if (!receipts || receipts.length === 0) return "";

  const headers = [
    "Date",
    "Category",
    "Amount",
    "Description",
    "Store",
    "Payment Method",
    "Notes",
  ].join(",");

  const rows = receipts.map((receipt) =>
    [
      formatDate(receipt.date),
      receipt.category || "",
      formatCurrency(receipt.amount, currency),
      `"${(receipt.description || "").replace(/"/g, '""')}"`,
      `"${(receipt.store || "").replace(/"/g, '""')}"`,
      receipt.paymentMethod || "",
      `"${(receipt.notes || "").replace(/"/g, '""')}"`,
    ].join(",")
  );

  return [headers, ...rows].join("\n");
};

// Convert incomes to CSV format
const incomesToCSV = (incomes, currency) => {
  if (!incomes || incomes.length === 0) return "";

  const headers = ["Date", "Source", "Amount", "Frequency", "Notes"].join(",");

  const rows = incomes.map((income) =>
    [
      formatDate(income.date),
      `"${(income.source || "").replace(/"/g, '""')}"`,
      formatCurrency(income.amount, currency),
      income.frequency || "",
      `"${(income.notes || "").replace(/"/g, '""')}"`,
    ].join(",")
  );

  return [headers, ...rows].join("\n");
};

// Convert budgets to CSV format
const budgetsToCSV = (budgets, currency) => {
  if (!budgets || Object.keys(budgets).length === 0) return "";

  const headers = [
    "Category",
    "Budget Amount",
    "Spent Amount",
    "Remaining",
    "Percentage Used",
  ].join(",");

  const rows = Object.entries(budgets).map(([category, budget]) => {
    const spent = budget.spent || 0;
    const amount = budget.amount || 0;
    const remaining = amount - spent;
    const percentage = amount > 0 ? ((spent / amount) * 100).toFixed(1) : 0;

    return [
      `"${category.replace(/"/g, '""')}"`,
      formatCurrency(amount, currency),
      formatCurrency(spent, currency),
      formatCurrency(remaining, currency),
      `${percentage}%`,
    ].join(",");
  });

  return [headers, ...rows].join("\n");
};

// Convert goals to CSV format
const goalsToCSV = (goals, currency) => {
  if (!goals || goals.length === 0) return "";

  const headers = [
    "Goal Name",
    "Target Amount",
    "Current Amount",
    "Remaining",
    "Target Date",
    "Status",
  ].join(",");

  const rows = goals.map((goal) => {
    const remaining = (goal.targetAmount || 0) - (goal.currentAmount || 0);
    const status = remaining <= 0 ? "Completed" : "In Progress";

    return [
      `"${(goal.name || "").replace(/"/g, '""')}"`,
      formatCurrency(goal.targetAmount, currency),
      formatCurrency(goal.currentAmount, currency),
      formatCurrency(remaining, currency),
      formatDate(goal.targetDate),
      status,
    ].join(",");
  });

  return [headers, ...rows].join("\n");
};

// Generate summary report
const generateSummaryReport = (userData, currency) => {
  const receipts = userData.receipts || [];
  const incomes = userData.incomes || [];
  const budgets = userData.budgets || {};
  const goals = userData.goals || [];

  const totalSpent = receipts.reduce(
    (sum, receipt) => sum + (receipt.amount || 0),
    0
  );
  const totalIncome = incomes.reduce(
    (sum, income) => sum + (income.amount || 0),
    0
  );
  const totalBudget = Object.values(budgets).reduce(
    (sum, budget) => sum + (budget.amount || 0),
    0
  );
  const totalSpentFromBudgets = Object.values(budgets).reduce(
    (sum, budget) => sum + (budget.spent || 0),
    0
  );
  const totalGoals = goals.reduce(
    (sum, goal) => sum + (goal.targetAmount || 0),
    0
  );
  const totalSaved = goals.reduce(
    (sum, goal) => sum + (goal.currentAmount || 0),
    0
  );

  const summary = {
    exportDate: new Date().toISOString(),
    totalReceipts: receipts.length,
    totalIncomes: incomes.length,
    totalCategories: userData.categories?.length || 0,
    totalBudgets: Object.keys(budgets).length,
    totalGoals: goals.length,
    financialSummary: {
      totalSpent: formatCurrency(totalSpent, currency),
      totalIncome: formatCurrency(totalIncome, currency),
      netSavings: formatCurrency(totalIncome - totalSpent, currency),
      totalBudget: formatCurrency(totalBudget, currency),
      totalSpentFromBudgets: formatCurrency(totalSpentFromBudgets, currency),
      budgetRemaining: formatCurrency(
        totalBudget - totalSpentFromBudgets,
        currency
      ),
      totalGoals: formatCurrency(totalGoals, currency),
      totalSaved: formatCurrency(totalSaved, currency),
      savingsProgress:
        totalGoals > 0
          ? `${((totalSaved / totalGoals) * 100).toFixed(1)}%`
          : "0%",
    },
  };

  return summary;
};

// Export data as CSV
export const exportDataAsCSV = async (userData, currency = "USD") => {
  try {
    const timestamp = new Date().toISOString().split("T")[0];
    const summary = generateSummaryReport(userData, currency);

    let csvContent = `Zenny App - Financial Data Export\n`;
    csvContent += `Export Date: ${summary.exportDate}\n`;
    csvContent += `Currency: ${currency}\n\n`;

    // Summary section
    csvContent += `SUMMARY\n`;
    csvContent += `Total Receipts,${summary.totalReceipts}\n`;
    csvContent += `Total Incomes,${summary.totalIncomes}\n`;
    csvContent += `Total Categories,${summary.totalCategories}\n`;
    csvContent += `Total Budgets,${summary.totalBudgets}\n`;
    csvContent += `Total Goals,${summary.totalGoals}\n\n`;

    csvContent += `FINANCIAL SUMMARY\n`;
    csvContent += `Total Spent,${summary.financialSummary.totalSpent}\n`;
    csvContent += `Total Income,${summary.financialSummary.totalIncome}\n`;
    csvContent += `Net Savings,${summary.financialSummary.netSavings}\n`;
    csvContent += `Total Budget,${summary.financialSummary.totalBudget}\n`;
    csvContent += `Total Spent from Budgets,${summary.financialSummary.totalSpentFromBudgets}\n`;
    csvContent += `Budget Remaining,${summary.financialSummary.budgetRemaining}\n`;
    csvContent += `Total Goals,${summary.financialSummary.totalGoals}\n`;
    csvContent += `Total Saved,${summary.financialSummary.totalSaved}\n`;
    csvContent += `Savings Progress,${summary.financialSummary.savingsProgress}\n\n`;

    // Receipts section
    if (userData.receipts && userData.receipts.length > 0) {
      csvContent += `RECEIPTS\n`;
      csvContent += receiptsToCSV(userData.receipts, currency);
      csvContent += "\n\n";
    }

    // Incomes section
    if (userData.incomes && userData.incomes.length > 0) {
      csvContent += `INCOMES\n`;
      csvContent += incomesToCSV(userData.incomes, currency);
      csvContent += "\n\n";
    }

    // Budgets section
    if (userData.budgets && Object.keys(userData.budgets).length > 0) {
      csvContent += `BUDGETS\n`;
      csvContent += budgetsToCSV(userData.budgets, currency);
      csvContent += "\n\n";
    }

    // Goals section
    if (userData.goals && userData.goals.length > 0) {
      csvContent += `SAVINGS GOALS\n`;
      csvContent += goalsToCSV(userData.goals, currency);
      csvContent += "\n\n";
    }

    // Categories section
    if (userData.categories && userData.categories.length > 0) {
      csvContent += `CATEGORIES\n`;
      csvContent += userData.categories.join(",");
      csvContent += "\n";
    }

    const fileName = `zenny_export_${timestamp}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent);

    if (Platform.OS === "web") {
      // For web, create a download link
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return { success: true, fileName };
    } else {
      // For mobile, share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Export Financial Data",
          UTI: "public.comma-separated-values-text",
        });
      }
      return { success: true, fileName, filePath };
    }
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export data");
  }
};

// Export data as JSON
export const exportDataAsJSON = async (userData, currency = "USD") => {
  try {
    const timestamp = new Date().toISOString().split("T")[0];
    const summary = generateSummaryReport(userData, currency);

    const exportData = {
      exportInfo: {
        app: "Zenny App",
        exportDate: summary.exportDate,
        currency: currency,
        version: "1.0.0",
      },
      summary: summary,
      data: {
        receipts: userData.receipts || [],
        incomes: userData.incomes || [],
        budgets: userData.budgets || {},
        goals: userData.goals || [],
        categories: userData.categories || [],
        notificationSettings: userData.notificationSettings || {},
      },
    };

    const fileName = `zenny_export_${timestamp}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    const jsonContent = JSON.stringify(exportData, null, 2);

    await FileSystem.writeAsStringAsync(filePath, jsonContent);

    if (Platform.OS === "web") {
      // For web, create a download link
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return { success: true, fileName };
    } else {
      // For mobile, share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/json",
          dialogTitle: "Export Financial Data",
          UTI: "public.json",
        });
      }
      return { success: true, fileName, filePath };
    }
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export data");
  }
};

// Get export options for the user
export const getExportOptions = () => [
  { label: "CSV File (Excel compatible)", value: "csv" },
  { label: "JSON File (Full data backup)", value: "json" },
];

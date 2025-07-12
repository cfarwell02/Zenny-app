import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
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

// Export data as PDF
export const exportDataAsPDF = async (userData, currency = "USD") => {
  try {
    const timestamp = new Date().toISOString().split("T")[0];
    const summary = generateSummaryReport(userData, currency);

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Zenny App - Financial Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #333; }
            .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; }
            .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .summary-value { font-size: 16px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .receipt-row { background-color: #f9f9f9; }
            .income-row { background-color: #e8f5e8; }
            .budget-row { background-color: #fff3cd; }
            .goal-row { background-color: #d1ecf1; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Zenny App - Financial Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Currency: ${currency}</p>
          </div>

          <div class="section">
            <div class="section-title">Financial Summary</div>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-label">Total Receipts</div>
                <div class="summary-value">${summary.totalReceipts}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Total Income</div>
                <div class="summary-value">${summary.totalIncomes}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Total Spent</div>
                <div class="summary-value">${
                  summary.financialSummary.totalSpent
                }</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Net Savings</div>
                <div class="summary-value">${
                  summary.financialSummary.netSavings
                }</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Total Budget</div>
                <div class="summary-value">${
                  summary.financialSummary.totalBudget
                }</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Savings Progress</div>
                <div class="summary-value">${
                  summary.financialSummary.savingsProgress
                }</div>
              </div>
            </div>
          </div>

          ${
            userData.receipts && userData.receipts.length > 0
              ? `
          <div class="section">
            <div class="section-title">Receipts</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Store</th>
                </tr>
              </thead>
              <tbody>
                ${userData.receipts
                  .map(
                    (receipt) => `
                  <tr class="receipt-row">
                    <td>${formatDate(receipt.date)}</td>
                    <td>${receipt.category || ""}</td>
                    <td>${formatCurrency(receipt.amount, currency)}</td>
                    <td>${receipt.description || ""}</td>
                    <td>${receipt.store || ""}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          ${
            userData.incomes && userData.incomes.length > 0
              ? `
          <div class="section">
            <div class="section-title">Income</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                ${userData.incomes
                  .map(
                    (income) => `
                  <tr class="income-row">
                    <td>${formatDate(income.date)}</td>
                    <td>${income.source || ""}</td>
                    <td>${formatCurrency(income.amount, currency)}</td>
                    <td>${income.frequency || ""}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          ${
            userData.budgets && Object.keys(userData.budgets).length > 0
              ? `
          <div class="section">
            <div class="section-title">Budgets</div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget Amount</th>
                  <th>Spent Amount</th>
                  <th>Remaining</th>
                  <th>Percentage Used</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(userData.budgets)
                  .map(([category, budget]) => {
                    const spent = budget.spent || 0;
                    const amount = budget.amount || 0;
                    const remaining = amount - spent;
                    const percentage =
                      amount > 0 ? ((spent / amount) * 100).toFixed(1) : 0;
                    return `
                    <tr class="budget-row">
                      <td>${category}</td>
                      <td>${formatCurrency(amount, currency)}</td>
                      <td>${formatCurrency(spent, currency)}</td>
                      <td>${formatCurrency(remaining, currency)}</td>
                      <td>${percentage}%</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          ${
            userData.goals && userData.goals.length > 0
              ? `
          <div class="section">
            <div class="section-title">Savings Goals</div>
            <table>
              <thead>
                <tr>
                  <th>Goal Name</th>
                  <th>Target Amount</th>
                  <th>Current Amount</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${userData.goals
                  .map((goal) => {
                    const remaining =
                      (goal.targetAmount || 0) - (goal.currentAmount || 0);
                    const status = remaining <= 0 ? "Completed" : "In Progress";
                    return `
                    <tr class="goal-row">
                      <td>${goal.name || ""}</td>
                      <td>${formatCurrency(goal.targetAmount, currency)}</td>
                      <td>${formatCurrency(goal.currentAmount, currency)}</td>
                      <td>${formatCurrency(remaining, currency)}</td>
                      <td>${status}</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }
        </body>
      </html>
    `;

    const fileName = `zenny_report_${timestamp}.pdf`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // Copy to our app's directory
    await FileSystem.copyAsync({
      from: uri,
      to: filePath,
    });

    if (Platform.OS === "web") {
      // For web, create a download link
      const response = await fetch(uri);
      const blob = await response.blob();
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
          mimeType: "application/pdf",
          dialogTitle: "Export Financial Report",
          UTI: "com.adobe.pdf",
        });
      }
      return { success: true, fileName, filePath };
    }
  } catch (error) {
    console.error("PDF Export error:", error);
    throw new Error("Failed to export PDF");
  }
};

// Get export options for the user
export const getExportOptions = () => [
  { label: "CSV File (Excel compatible)", value: "csv" },
  { label: "JSON File (Full data backup)", value: "json" },
  { label: "PDF Report (Professional format)", value: "pdf" },
];

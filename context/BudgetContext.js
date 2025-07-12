import React, { createContext, useState, useContext, useEffect } from "react";
import { CategoryContext } from "./CategoryContext";
import { DataContext } from "./DataContext";

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { categories } = useContext(CategoryContext);
  const { userData, saveBudgets } = useContext(DataContext);
  const [budgets, setBudgets] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [threshold, setThreshold] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Sync with DataContext
  useEffect(() => {
    if (userData.budgets) {
      setCategoryBudgets(userData.budgets);
    }
  }, [userData.budgets]);

  const addExpense = (expense) => {
    setExpenses((prev) => [...prev, expense]);
  };

  const removeExpense = (expenseId) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== expenseId)
    );
  };

  const updateCategoryBudget = async (category, amount, threshold = 80) => {
    const updatedBudgets = {
      ...categoryBudgets,
      [category]: {
        ...(typeof categoryBudgets[category] === "object"
          ? categoryBudgets[category]
          : { notified: false }),
        amount,
        threshold,
      },
    };

    setCategoryBudgets(updatedBudgets);
    await saveBudgets(updatedBudgets);
  };

  const cleanupDeletedCategoryBudgets = async (categoryToDelete) => {
    const updated = { ...categoryBudgets };
    delete updated[categoryToDelete];
    setCategoryBudgets(updated);
    await saveBudgets(updated);
  };

  const checkAndNotifyThreshold = async (category, spent) => {
    const catBudget = categoryBudgets[category];
    if (!catBudget || !catBudget.amount) return;
    const threshold = Number(catBudget.threshold) || 80;
    const notified = catBudget.notified;
    const percentSpent = (spent / catBudget.amount) * 100;
    if (percentSpent >= threshold && !notified) {
      // Trigger notification (implementation in screen)
      const updatedBudgets = {
        ...categoryBudgets,
        [category]: {
          ...catBudget,
          notified: true,
        },
      };
      setCategoryBudgets(updatedBudgets);
      await saveBudgets(updatedBudgets);
      return true;
    }
    return false;
  };

  // Clear all budgets and expenses
  const clearBudgets = async () => {
    setCategoryBudgets({});
    setExpenses([]);
    await saveBudgets({});
  };

  useEffect(() => {
    // Ensure all categories are tracked in categoryBudgets
    setCategoryBudgets((prev) => {
      const updated = { ...prev };
      categories.forEach((cat) => {
        if (typeof updated[cat] !== "object") {
          updated[cat] = { amount: 0, threshold: 80, notified: false };
        }
      });
      return updated;
    });
  }, [categories]);

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        setBudgets,
        categoryBudgets,
        setCategoryBudgets,
        updateCategoryBudget,
        threshold,
        setThreshold,
        expenses,
        setExpenses,
        addExpense,
        cleanupDeletedCategoryBudgets,
        removeExpense,
        checkAndNotifyThreshold,
        clearBudgets, // Expose clearBudgets
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

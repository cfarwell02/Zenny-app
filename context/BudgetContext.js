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
    // Only check if budget exists, has a positive amount, and is properly configured
    if (!catBudget || !catBudget.amount || catBudget.amount <= 0) return false;

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
    // Only ensure categories are tracked if they already have budget data
    // Don't create default entries for categories without budgets
    setCategoryBudgets((prev) => {
      const updated = { ...prev };
      categories.forEach((cat) => {
        // Only create entry if it doesn't exist at all
        if (!(cat in updated)) {
          // Don't create default entries - let them be undefined until user sets a budget
          // This prevents notifications for categories without actual budgets
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

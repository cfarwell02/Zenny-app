import React, { createContext, useState, useContext, useEffect } from "react";
import { CategoryContext } from "./CategoryContext";

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { categories } = useContext(CategoryContext);
  const [budgets, setBudgets] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState({});

  const [threshold, setThreshold] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const addExpense = (expense) => {
    setExpenses((prev) => [...prev, expense]);
  };

  const removeExpense = (expenseId) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== expenseId)
    );
  };

  const updateCategoryBudget = (category, amount) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: {
        ...(typeof prev[category] === "object"
          ? prev[category]
          : { threshold: 80, notified: false }),
        amount,
      },
    }));
  };

  const cleanupDeletedCategoryBudgets = (categoryToDelete) => {
    setCategoryBudgets((prev) => {
      const updated = { ...prev };
      delete updated[categoryToDelete];
      return updated;
    });
  };

  const checkAndNotifyThreshold = (category, spent) => {
    const catBudget = categoryBudgets[category];
    if (!catBudget || !catBudget.amount) return;
    const threshold = Number(catBudget.threshold) || 80;
    const notified = catBudget.notified;
    const percentSpent = (spent / catBudget.amount) * 100;
    if (percentSpent >= threshold && !notified) {
      // Trigger notification (implementation in screen)
      setCategoryBudgets((prev) => ({
        ...prev,
        [category]: {
          ...catBudget,
          notified: true,
        },
      }));
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Ensure all categories are tracked in categoryBudgets
    setCategoryBudgets((prev) => {
      const updated = { ...prev };

      categories.forEach((cat) => {
        if (updated[cat] === undefined) {
          updated[cat] = 0; // Initialize new category with $0 budget
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
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

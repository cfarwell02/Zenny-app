import React, { createContext, useState } from "react";

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState({
    Food: [],
    Shopping: [],
    Transport: [],
    Bills: [],
    Other: [],
  }); // default budget

  const [threshold, setThreshold] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const addExpense = (expense) => {
    setExpenses((prev) => [...prev, expense]);
  };

  const updateCategoryBudget = (category, amount) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: amount,
    }));
  };

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
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

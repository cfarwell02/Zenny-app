import React, { createContext, useState } from "react";

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budget, setBudget] = useState(0); // default budget in $
  const [categoryBudgets, setCategoryBudgets] = useState({
    Food: 0,
    Shopping: 0,
    Transport: 0,
    Bills: 0,
    Other: 0,
  }); // default budget

  const [threshold, setThreshold] = useState(75); // default alert threshold %
  const [expenses, setExpenses] = useState([]); // example expense array

  const updateCategoryBudget = (category, amount) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [category]: amount,
    }));
  };

  return (
    <BudgetContext.Provider
      value={{
        budget,
        setBudget,
        threshold,
        setThreshold,
        expenses,
        setExpenses,
        categoryBudgets,
        setCategoryBudgets,
        updateCategoryBudget,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

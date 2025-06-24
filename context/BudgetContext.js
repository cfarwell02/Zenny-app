import React, { createContext, useState } from "react";

export const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budget, setBudget] = useState(0); // default budget
  const [threshold, setThreshold] = useState(75); // default alert threshold %
  const [expenses, setExpenses] = useState([]); // example expense array

  return (
    <BudgetContext.Provider
      value={{
        budget,
        setBudget,
        threshold,
        setThreshold,
        expenses,
        setExpenses,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

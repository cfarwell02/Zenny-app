import React, { createContext, useState } from "react";

export const IncomeContext = createContext();

export const IncomeProvider = ({ children }) => {
  const [incomeList, setIncomeList] = useState([]);

  const addIncome = (income) => {
    setIncomeList((prev) => [income, ...prev]);
  };

  const deleteIncome = (id) => {
    setIncomeList((prev) => prev.filter((item) => item.id !== id));
  };

  const editIncome = (id, updated) => {
    setIncomeList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  return (
    <IncomeContext.Provider
      value={{ incomeList, addIncome, deleteIncome, editIncome }}
    >
      {children}
    </IncomeContext.Provider>
  );
};

import React, { createContext, useState, useContext, useEffect } from "react";
import { DataContext } from "./DataContext";

export const IncomeContext = createContext();

export const IncomeProvider = ({ children }) => {
  const [incomeList, setIncomeList] = useState([]);
  const { userData, saveIncomes } = useContext(DataContext);

  // Sync with DataContext
  useEffect(() => {
    setIncomeList(userData.incomes || []);
  }, [userData.incomes]);

  const addIncome = async (income) => {
    const updatedIncomes = [income, ...incomeList];
    setIncomeList(updatedIncomes);

    // Save to Firestore
    await saveIncomes(updatedIncomes);
  };

  const deleteIncome = async (id) => {
    const updatedIncomes = incomeList.filter((item) => item.id !== id);
    setIncomeList(updatedIncomes);

    // Save to Firestore
    await saveIncomes(updatedIncomes);
  };

  const editIncome = async (id, updated) => {
    const updatedIncomes = incomeList.map((item) =>
      item.id === id ? { ...item, ...updated } : item
    );
    setIncomeList(updatedIncomes);

    // Save to Firestore
    await saveIncomes(updatedIncomes);
  };

  return (
    <IncomeContext.Provider
      value={{ incomeList, addIncome, deleteIncome, editIncome }}
    >
      {children}
    </IncomeContext.Provider>
  );
};

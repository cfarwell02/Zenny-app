// ReceiptContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { BudgetContext } from "./BudgetContext";
import { DataContext } from "./DataContext";

export const ReceiptContext = createContext();

export const ReceiptProvider = ({ children }) => {
  const [receipts, setReceipts] = useState([]);
  const { addExpense } = useContext(BudgetContext);
  const { userData, saveReceipts } = useContext(DataContext);

  // Sync with DataContext
  useEffect(() => {
    setReceipts(userData.receipts || []);
  }, [userData.receipts]);

  const addReceipt = async (newReceipt) => {
    try {
      console.log("📝 ReceiptContext - adding receipt:", newReceipt);
      const stringId = String(newReceipt.id);
      const receiptWithStringId = {
        ...newReceipt,
        id: stringId,
      };

      const updatedReceipts = [...receipts, receiptWithStringId];
      console.log(
        "📝 ReceiptContext - updated receipts array:",
        updatedReceipts.length
      );
      setReceipts(updatedReceipts);

      // Save to Firestore
      console.log("📝 ReceiptContext - saving to Firestore...");
      await saveReceipts(updatedReceipts);
      console.log("✅ ReceiptContext - receipt saved successfully");

      addExpense(receiptWithStringId);
    } catch (error) {
      console.error("❌ Error adding receipt:", error);
    }
  };

  const deleteReceipt = async (receiptId) => {
    if (!receiptId) {
      throw new Error("Receipt ID is required for deletion");
    }

    try {
      const updatedReceipts = receipts.filter((r) => r.id !== receiptId);
      setReceipts(updatedReceipts);

      // Save to Firestore
      await saveReceipts(updatedReceipts);
    } catch (error) {
      throw error;
    }
  };

  // Clear all receipts
  const clearReceipts = async () => {
    setReceipts([]);
    await saveReceipts([]);
  };

  return (
    <ReceiptContext.Provider
      value={{ receipts, addReceipt, deleteReceipt, clearReceipts }}
    >
      {children}
    </ReceiptContext.Provider>
  );
};

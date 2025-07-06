// ReceiptContext.js
import React, { createContext, useState, useContext } from "react";
import firestore from "@react-native-firebase/firestore";
import { BudgetContext } from "./BudgetContext"; // ✅ import this

export const ReceiptContext = createContext();

export const ReceiptProvider = ({ children }) => {
  const [receipts, setReceipts] = useState([]);
  const { addExpense } = useContext(BudgetContext); // ✅ get from context

  const addReceipt = async (newReceipt) => {
    try {
      const stringId = String(newReceipt.id);
      const receiptWithStringId = {
        ...newReceipt,
        id: stringId,
      };

      await firestore()
        .collection("receipts")
        .doc(stringId)
        .set(receiptWithStringId);

      setReceipts((prev) => [...prev, receiptWithStringId]);

      addExpense(receiptWithStringId); // ✅ Push into expenses context
    } catch (error) {
      console.error("❌ Error adding receipt:", error);
    }
  };

  const deleteReceipt = async (receiptId) => {
    if (!receiptId) {
      throw new Error("Receipt ID is required for deletion");
    }

    try {
      await firestore().collection("receipts").doc(receiptId).delete();
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    } catch (error) {
      throw error;
    }
  };

  return (
    <ReceiptContext.Provider value={{ receipts, addReceipt, deleteReceipt }}>
      {children}
    </ReceiptContext.Provider>
  );
};

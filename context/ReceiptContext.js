import React, { createContext, useState } from "react";

export const ReceiptContext = createContext();

export const ReceiptProvider = ({ children }) => {
  const [receipts, setReceipts] = useState([
    {
      id: 1,
      image: "https://via.placeholder.com/150", // placeholder image
      amount: 15.5,
      category: "Food",
      tag: "Lunch with Mom",
      date: new Date().toISOString(),
    },
    {
      id: 2,
      image: "https://via.placeholder.com/150",
      amount: 23,
      category: "Bills",
      tag: "Electric",
      date: new Date().toISOString(),
    },
  ]);

  const addReceipt = (newReceipt) => {
    setReceipts((prev) => [...prev, newReceipt]);
  };

  return (
    <ReceiptContext.Provider value={{ receipts, addReceipt }}>
      {children}
    </ReceiptContext.Provider>
  );
};

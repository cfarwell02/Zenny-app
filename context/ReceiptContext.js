import React, { createContext, useState } from "react";

export const ReceiptContext = createContext();

export const ReceiptProvider = ({ children }) => {
  const [receipts, setReceipts] = useState([]);

  const addReceipt = (newReceipt) => {
    setReceipts((prev) => [...prev, newReceipt]);
  };

  return (
    <ReceiptContext.Provider value={{ receipts, addReceipt }}>
      {children}
    </ReceiptContext.Provider>
  );
};

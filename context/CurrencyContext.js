import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CurrencyContext = createContext();

// Supported currencies with their symbols and conversion rates (to USD as base)
const SUPPORTED_CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar", rate: 1 },
  EUR: { symbol: "€", name: "Euro", rate: 0.85 },
  GBP: { symbol: "£", name: "British Pound", rate: 0.73 },
  CAD: { symbol: "C$", name: "Canadian Dollar", rate: 1.25 },
  AUD: { symbol: "A$", name: "Australian Dollar", rate: 1.35 },
  JPY: { symbol: "¥", name: "Japanese Yen", rate: 110 },
  INR: { symbol: "₹", name: "Indian Rupee", rate: 75 },
  CNY: { symbol: "¥", name: "Chinese Yuan", rate: 6.45 },
  BRL: { symbol: "R$", name: "Brazilian Real", rate: 5.25 },
  MXN: { symbol: "$", name: "Mexican Peso", rate: 20.5 },
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  // Load saved currency preference
  useEffect(() => {
    loadCurrencyPreference();
  }, []);

  const loadCurrencyPreference = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem("selectedCurrency");
      if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
        setSelectedCurrency(savedCurrency);
      }
    } catch (error) {
      console.log("Error loading currency preference:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = async (currencyCode) => {
    if (SUPPORTED_CURRENCIES[currencyCode]) {
      setSelectedCurrency(currencyCode);
      try {
        await AsyncStorage.setItem("selectedCurrency", currencyCode);
      } catch (error) {
        console.log("Error saving currency preference:", error);
      }
    }
  };

  // Convert amount from USD to selected currency
  const convertCurrency = (amountUSD) => {
    const currency = SUPPORTED_CURRENCIES[selectedCurrency];
    return amountUSD * currency.rate;
  };

  // Convert amount from selected currency to USD
  const convertToUSD = (amount) => {
    const currency = SUPPORTED_CURRENCIES[selectedCurrency];
    return amount / currency.rate;
  };

  // Format amount with currency symbol
  const formatCurrency = (amount, currencyCode = selectedCurrency) => {
    const currency = SUPPORTED_CURRENCIES[currencyCode];
    if (!currency) return `${amount}`;

    // Handle different decimal places for different currencies
    const decimalPlaces = currencyCode === "JPY" ? 0 : 2;
    const formattedAmount = Number(amount).toFixed(decimalPlaces);

    return `${currency.symbol}${formattedAmount}`;
  };

  // Get currency options for picker
  const getCurrencyOptions = () => {
    return Object.entries(SUPPORTED_CURRENCIES).map(([code, currency]) => ({
      label: `${currency.symbol} ${currency.name} (${code})`,
      value: code,
    }));
  };

  const value = {
    selectedCurrency,
    updateCurrency,
    convertCurrency,
    convertToUSD,
    formatCurrency,
    getCurrencyOptions,
    SUPPORTED_CURRENCIES,
    loading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

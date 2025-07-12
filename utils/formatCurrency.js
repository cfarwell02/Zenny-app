import { useCurrency } from "../context/CurrencyContext";

// Hook to format currency using the current currency context
export const useFormatCurrency = () => {
  const { formatCurrency, convertCurrency, convertToUSD } = useCurrency();

  return {
    formatCurrency,
    convertCurrency,
    convertToUSD,
  };
};

// Standalone function for formatting currency (for use outside of components)
export const formatCurrencyAmount = (amount, currencyCode = "USD") => {
  const currencies = {
    USD: { symbol: "$", rate: 1 },
    EUR: { symbol: "€", rate: 0.85 },
    GBP: { symbol: "£", rate: 0.73 },
    CAD: { symbol: "C$", rate: 1.25 },
    AUD: { symbol: "A$", rate: 1.35 },
    JPY: { symbol: "¥", rate: 110 },
    INR: { symbol: "₹", rate: 75 },
    CNY: { symbol: "¥", rate: 6.45 },
    BRL: { symbol: "R$", rate: 5.25 },
    MXN: { symbol: "$", rate: 20.5 },
  };

  const currency = currencies[currencyCode] || currencies.USD;
  const decimalPlaces = currencyCode === "JPY" ? 0 : 2;
  const formattedAmount = Number(amount).toFixed(decimalPlaces);

  return `${currency.symbol}${formattedAmount}`;
};

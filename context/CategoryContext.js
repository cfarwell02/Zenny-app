import React, { createContext, useState, useContext, useEffect } from "react";
import { DataContext } from "./DataContext";

export const CategoryContext = createContext();

const defaultCategories = ["Food", "Shopping", "Transport", "Bills"];

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(defaultCategories);
  const { userData, saveCategories } = useContext(DataContext);

  // Sync with DataContext
  useEffect(() => {
    if (userData.categories && userData.categories.length > 0) {
      setCategories(userData.categories);
    } else {
      setCategories(defaultCategories);
    }
  }, [userData.categories]);

  const addCategory = async (categoryName) => {
    if (!categories.includes(categoryName)) {
      const updatedCategories = [...categories, categoryName];
      setCategories(updatedCategories);
      await saveCategories(updatedCategories);
    }
  };

  const deleteCategory = async (categoryName) => {
    const updatedCategories = categories.filter((cat) => cat !== categoryName);
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        setCategories,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

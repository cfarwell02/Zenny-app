import React, { createContext, useState, useContext, useEffect } from "react";
import { DataContext } from "./DataContext";

export const CategoryContext = createContext();

// Comprehensive list of 50+ category options for users to choose from
export const availableCategories = [
  // Essential Categories
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Housing",
  "Healthcare",
  "Entertainment",
  "Education",

  // Food & Dining Subcategories
  "Groceries",
  "Restaurants",
  "Coffee & Drinks",
  "Fast Food",
  "Takeout",
  "Alcohol",
  "Snacks",

  // Transportation
  "Gas",
  "Public Transit",
  "Ride Sharing",
  "Car Maintenance",
  "Parking",
  "Tolls",
  "Car Insurance",
  "Car Payment",

  // Shopping
  "Clothing",
  "Electronics",
  "Home & Garden",
  "Books",
  "Gifts",
  "Personal Care",
  "Beauty",

  // Bills & Utilities
  "Electricity",
  "Water",
  "Internet",
  "Phone",
  "Cable/Streaming",
  "Gas/Heating",
  "Trash",

  // Housing
  "Rent",
  "Mortgage",
  "Home Insurance",
  "Property Tax",
  "Home Maintenance",
  "Furniture",
  "Decor",

  // Healthcare
  "Medical Bills",
  "Dental",
  "Vision",
  "Prescriptions",
  "Health Insurance",
  "Fitness",
  "Supplements",

  // Entertainment
  "Movies",
  "Games",
  "Sports",
  "Concerts",
  "Hobbies",
  "Vacations",
  "Travel",

  // Education
  "Tuition",
  "Books & Supplies",
  "Student Loans",
  "Courses",
  "Workshops",

  // Business & Work
  "Business Expenses",
  "Work Supplies",
  "Professional Development",

  // Personal
  "Pets",
  "Childcare",
  "Charity",
  "Investments",
  "Savings",
  "Emergency Fund",

  // Other
  "Miscellaneous",
  "Fees",
  "Taxes",
  "Insurance",
  "Legal",
  "Banking",
  "ATM Fees",
];

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const { userData, saveCategories } = useContext(DataContext);

  // Sync with DataContext
  useEffect(() => {
    if (userData.categories && userData.categories.length > 0) {
      setCategories(userData.categories);
    } else {
      setCategories([]); // Start with no categories
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

  // Add multiple categories at once
  const addMultipleCategories = async (categoryNames) => {
    const newCategories = categoryNames.filter(
      (cat) => !categories.includes(cat)
    );
    if (newCategories.length > 0) {
      const updatedCategories = [...categories, ...newCategories];
      setCategories(updatedCategories);
      await saveCategories(updatedCategories);
    }
  };

  // Clear all categories
  const clearCategories = async () => {
    setCategories([]);
    await saveCategories([]);
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        setCategories,
        addCategory,
        deleteCategory,
        addMultipleCategories,
        clearCategories,
        availableCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

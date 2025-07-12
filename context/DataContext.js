import React, { createContext, useState, useContext, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    receipts: [],
    incomes: [],
    goals: [],
    categories: [],
    budgets: {},
    notificationSettings: { enabled: false },
  });

  // Get current user
  const getCurrentUser = () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  };

  // Initialize user data in Firestore (called on sign-up)
  const initializeUserData = async () => {
    const user = getCurrentUser();
    if (!user) {
      return;
    }
    setIsLoading(true);
    try {
      const userDoc = firestore().collection("users").doc(user.uid);
      const userSnapshot = await userDoc.get();
      if (userSnapshot.exists) {
        return;
      }
      const defaultData = {
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        receipts: [],
        incomes: [],
        goals: [],
        categories: ["Food", "Shopping", "Transport", "Bills"],
        budgets: {},
        notificationSettings: { enabled: false },
      };
      await userDoc.set(defaultData);
      await loadAllUserData();
    } catch (error) {
      // Don't throw error, just log it
    } finally {
      setIsLoading(false);
    }
  };

  // Load all user data from Firestore
  const loadAllUserData = async () => {
    const user = getCurrentUser();
    if (!user) {
      return;
    }
    setIsLoading(true);
    try {
      const userDoc = firestore().collection("users").doc(user.uid);
      const snapshot = await userDoc.get();
      if (snapshot.exists) {
        const data = snapshot.data();
        const newUserData = {
          receipts: data.receipts || [],
          incomes: data.incomes || [],
          goals: data.goals || [],
          categories: data.categories || [
            "Food",
            "Shopping",
            "Transport",
            "Bills",
          ],
          budgets: data.budgets || {},
          notificationSettings: data.notificationSettings || { enabled: false },
        };
        setUserData(newUserData);
      } else {
        await initializeUserData();
      }
    } catch (error) {
      // Don't throw error, just log it
    } finally {
      setIsLoading(false);
    }
  };

  // Save all user data to Firestore
  const saveAllUserData = async (dataOverride) => {
    const user = getCurrentUser();
    if (!user) {
      return;
    }
    const dataToSave = dataOverride || userData;
    try {
      await firestore()
        .collection("users")
        .doc(user.uid)
        .set(
          {
            ...dataToSave,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
    } catch (error) {
      // Don't throw error, just log it
    }
  };

  // Individual data operations
  const saveReceipts = async (receipts) => {
    await saveAllUserData({ ...userData, receipts });
    setUserData((prev) => ({ ...prev, receipts }));
  };

  const saveIncomes = async (incomes) => {
    setUserData((prev) => ({ ...prev, incomes }));
    await saveAllUserData();
  };

  const saveGoals = async (goals) => {
    setUserData((prev) => ({ ...prev, goals }));
    await saveAllUserData();
  };

  const saveCategories = async (categories) => {
    setUserData((prev) => ({ ...prev, categories }));
    await saveAllUserData();
  };

  const saveBudgets = async (budgets) => {
    setUserData((prev) => ({ ...prev, budgets }));
    await saveAllUserData();
  };

  const saveNotificationSettings = async (settings) => {
    setUserData((prev) => ({ ...prev, notificationSettings: settings }));
    await saveAllUserData();
  };

  // Clear all user data
  const clearUserData = async () => {
    const user = getCurrentUser();
    if (!user) {
      return;
    }
    try {
      await firestore().collection("users").doc(user.uid).delete();
      setUserData({
        receipts: [],
        incomes: [],
        goals: [],
        categories: [],
        budgets: {},
        notificationSettings: { enabled: false },
      });
    } catch (error) {
      console.error("Error clearing user data:", error);
      throw error;
    }
  };

  // Load data on auth state change
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        loadAllUserData();
      } else {
        setUserData({
          receipts: [],
          incomes: [],
          goals: [],
          categories: [],
          budgets: {},
          notificationSettings: { enabled: false },
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Debug function to log current data state
  const debugDataState = () => {};

  return (
    <DataContext.Provider
      value={{
        isLoading,
        userData,
        setUserData,
        initializeUserData,
        loadAllUserData,
        saveAllUserData,
        saveReceipts,
        saveIncomes,
        saveGoals,
        saveCategories,
        saveBudgets,
        saveNotificationSettings,
        clearUserData,
        debugDataState,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

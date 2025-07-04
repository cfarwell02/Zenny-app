import React, { createContext, useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export const CategoryContext = createContext();

const defaultCategories = ["Food", "Shopping", "Transport", "Bills"];

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("categories")
      .onSnapshot((snapshot) => {
        const custom = snapshot.docs.map((doc) => doc.data().name);
        const combined = [...new Set([...defaultCategories, ...custom])];
        setCategories(combined);
      });

    return () => unsubscribe(); // ✅ cleanup on unmount
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

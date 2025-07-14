import React, { createContext, useState, useEffect, useContext } from "react";
import auth from "@react-native-firebase/auth";
import { DataContext } from "./DataContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const { initializeUserData } = useContext(DataContext);

  console.log("🔄 AuthContext - component render", {
    hasUser: !!user,
    initializing,
    error: !!error,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    console.log("🔄 AuthContext - setting up auth listener");
    const unsubscribe = auth().onAuthStateChanged((usr) => {
      console.log("🔄 AuthContext - auth state changed", {
        hasUser: !!usr,
        userId: usr?.uid,
        timestamp: new Date().toISOString(),
      });
      setUser(usr);
      setInitializing(false); // Always set to false after first auth state check
    });
    return unsubscribe;
  }, []); // Remove initializing dependency

  const signUp = async (email, password) => {
    setError(null);
    try {
      console.log("🔄 AuthContext - signing up user");
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );

      // Initialize user data in Firestore after successful sign-up
      if (userCredential.user) {
        console.log("🔄 AuthContext - initializing user data");
        await initializeUserData();
      }
    } catch (e) {
      console.error("❌ AuthContext - sign up error:", e.message);
      setError(e.message);
    }
  };

  const signIn = async (email, password) => {
    setError(null);
    try {
      console.log("🔄 AuthContext - signing in user");
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      console.error("❌ AuthContext - sign in error:", e.message);
      setError(e.message);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      console.log("🔄 AuthContext - signing out user");
      await auth().signOut();
    } catch (e) {
      console.error("❌ AuthContext - sign out error:", e.message);
      setError(e.message);
    }
  };

  const refreshUser = async () => {
    await auth().currentUser?.reload();
    setUser(auth().currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        error,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

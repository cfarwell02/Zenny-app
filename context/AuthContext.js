import React, { createContext, useState, useEffect, useContext } from "react";
import auth from "@react-native-firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  const signUp = async (email, password) => {
    setError(null);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  const signIn = async (email, password) => {
    setError(null);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await auth().signOut();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, initializing, error, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

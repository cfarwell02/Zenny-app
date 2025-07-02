import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { supabase } from "../supabase";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    try {
      const authFn = isSigningUp
        ? supabase.auth.signUp
        : supabase.auth.signInWithPassword;

      const { data, error } = await authFn({ email, password });

      if (error) {
        console.error("❌ Supabase error:", error);
        Alert.alert("Auth Error", error.message);
      } else {
        Alert.alert(
          "Success",
          isSigningUp ? "Check your email to confirm." : "Logged in!"
        );
        onAuthSuccess(); // move to Home screen
      }
    } catch (err) {
      console.error("🌐 Network error:", err.message);
      Alert.alert("Network Error", "Please check your internet connection.");
    }
  };

  const signInWithGoogle = async () => {
    const redirectTo = AuthSession.makeRedirectUri({ useProxy: true });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("❌ Google Sign-In Error:", error.message);
      Alert.alert("Sign-In Failed", error.message);
    } else {
      console.log("✅ Redirecting to Google login...");
      // Auth will redirect back to app automatically
    }
  };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ padding: 20 }}>
          <View style={{ marginTop: 20 }}>
            <Button title="Sign In with Google" onPress={signInWithGoogle} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
export default AuthScreen;

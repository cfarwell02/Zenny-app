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

  return (
    <KeyboardAvoidingView>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, marginBottom: 20 }}>
            {isSigningUp ? "Sign Up" : "Log In"}
          </Text>
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
            placeholderTextColor={theme.placeholder}
            style={{
              marginBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
              color: theme.text,
              backgroundColor: theme.input,
            }}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            placeholderTextColor={theme.placeholder}
            style={{
              marginBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
              color: theme.text,
              backgroundColor: theme.input,
            }}
          />
          <Button
            title={isSigningUp ? "Sign Up" : "Log In"}
            onPress={handleAuth}
          />
          <Text
            style={{ marginTop: 20, textAlign: "center", color: "blue" }}
            onPress={() => setIsSigningUp(!isSigningUp)}
          >
            {isSigningUp
              ? "Already have an account? Log in"
              : "No account? Sign up"}
          </Text>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
export default AuthScreen;

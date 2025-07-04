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
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const AuthScreen = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "813553055334-haihet8pud9hmb8dmbrrhn3858vum4sd.apps.googleusercontent.com", // Replace with Firebase Web client ID
      androidClientId:
        "813553055334-sfkl8a3fh1k3lbodp2raqbvl8ut83qg7.apps.googleusercontent.com", // Optional: Only needed for Android device sign-in
    });

    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        onAuthSuccess();
      }
    });

    return unsubscribe;
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    try {
      let userCredential;
      if (isSigningUp) {
        userCredential = await auth().createUserWithEmailAndPassword(
          email,
          password
        );
      } else {
        userCredential = await auth().signInWithEmailAndPassword(
          email,
          password
        );
      }

      Alert.alert("Success", isSigningUp ? "Account created!" : "Logged in!");
      onAuthSuccess(); // move to Home screen
    } catch (err) {
      console.error("❌ Firebase Auth Error:", err.message);
      Alert.alert("Auth Error", err.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      Alert.alert("Success", "Signed in with Google!");
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error.message);
      Alert.alert("Google Sign-In Failed", error.message);
    }
  };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ padding: 20 }}>
          {/* Keep your email/password logic if you still plan to support it */}
          {/* 
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            style={{ marginBottom: 10 }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={{ marginBottom: 10 }}
          />
          <Button
            title={isSigningUp ? "Sign Up" : "Log In"}
            onPress={handleAuth}
          />
          <Button
            title={isSigningUp ? "Have an account? Log in" : "Need an account? Sign up"}
            onPress={() => setIsSigningUp(!isSigningUp)}
          /> 
          */}

          <View style={{ marginTop: 20 }}>
            <Button title="Sign In with Google" onPress={signInWithGoogle} />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

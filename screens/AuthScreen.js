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
  const [isLoading, setIsLoading] = useState(false);

  // Make theme optional to avoid potential context issues
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "813553055334-haihet8pud9hmb8dmbrrhn3858vum4sd.apps.googleusercontent.com", // Web client ID from google-services.json
      // Remove androidClientId - it's automatically detected from google-services.json
    });

    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        onAuthSuccess?.();
      }
    });

    return unsubscribe;
  }, [onAuthSuccess]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    setIsLoading(true);
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
    } catch (err) {
      Alert.alert("Auth Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();

      // Check if we got a valid result
      if (!userInfo || !userInfo.data || !userInfo.data.idToken) {
        throw new Error("Failed to get ID token from Google Sign-In");
      }

      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.data.idToken
      );

      await auth().signInWithCredential(googleCredential);

      Alert.alert("Success", "Signed in with Google!");
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error);

      // Handle specific Google Sign-In errors
      if (error.code === "SIGN_IN_CANCELLED") {
        Alert.alert("Sign-In Cancelled", "You cancelled the Google Sign-In");
      } else if (error.code === "IN_PROGRESS") {
        Alert.alert(
          "Sign-In in Progress",
          "Please wait for the current sign-in to complete"
        );
      } else if (error.code === "PLAY_SERVICES_NOT_AVAILABLE") {
        Alert.alert(
          "Play Services Required",
          "Please update Google Play Services"
        );
      } else {
        Alert.alert(
          "Google Sign-In Failed",
          error.message || "An unknown error occurred"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme?.background || "#ffffff" }}
      >
        <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              color: theme?.text || "#000000",
            }}
          >
            Welcome to Zenny
          </Text>

          {/* Email/Password Authentication (uncomment if needed) */}
          {/* 
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.textSecondary}
            style={{ 
              marginBottom: 10, 
              padding: 10, 
              borderWidth: 1, 
              borderColor: theme.border,
              backgroundColor: theme.surface,
              color: theme.text
            }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            style={{ 
              marginBottom: 10, 
              padding: 10, 
              borderWidth: 1, 
              borderColor: theme.border,
              backgroundColor: theme.surface,
              color: theme.text
            }}
          />
          <Button
            title={isSigningUp ? "Sign Up" : "Log In"}
            onPress={handleAuth}
            disabled={isLoading}
          />
          <Button
            title={isSigningUp ? "Have an account? Log in" : "Need an account? Sign up"}
            onPress={() => setIsSigningUp(!isSigningUp)}
            disabled={isLoading}
          /> 
          */}

          <View style={{ marginTop: 20 }}>
            <Button
              title={isLoading ? "Signing In..." : "Sign In with Google"}
              onPress={signInWithGoogle}
              disabled={isLoading}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

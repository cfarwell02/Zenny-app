import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Onboarding from "../components/Onboarding";

const { width, height } = Dimensions.get("window");

const AuthScreen = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Make theme optional to avoid potential context issues
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.darkMode ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "813553055334-haihet8pud9hmb8dmbrrhn3858vum4sd.apps.googleusercontent.com",
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
        setShowOnboarding(true); // Always show onboarding after sign-up
        return; // Do not proceed to main app yet
      } else {
        userCredential = await auth().signInWithEmailAndPassword(
          email,
          password
        );
        Alert.alert("Success", "Logged in!");
        onAuthSuccess?.();
      }
    } catch (err) {
      Alert.alert("Auth Error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Forgot Password", "Please enter your email address first.");
      return;
    }
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert("Password Reset", "A password reset email has been sent.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();

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

  if (showOnboarding) {
    return (
      <Onboarding
        onFinish={() => {
          setShowOnboarding(false);
          onAuthSuccess?.();
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Zenny</Text>
            <Text style={styles.subtitle}>
              {isSigningUp
                ? "Create your account to get started"
                : "Sign in to your account"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={theme?.textSecondary || "#999"}
                style={[styles.input, emailFocused && styles.inputFocused]}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View
              style={{
                position: "relative",
                height: 56,
                alignItems: "center",
                width: "100%",
              }}
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={theme?.textSecondary || "#999"}
                secureTextEntry={!showPassword}
                style={[
                  styles.input,
                  passwordFocused && styles.inputFocused,
                  { width: "100%" },
                ]}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={{ position: "absolute", right: 16, top: 16 }}
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={theme?.textSecondary || "#888"}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link (only when signing in) */}
            {!isSigningUp && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={{
                  alignSelf: "flex-start",
                  marginBottom: 12,
                  paddingTop: 8,
                }}
              >
                <Text
                  style={{
                    color: theme?.primary || "#4D90FE",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}

            {/* Primary Auth Button */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSigningUp ? "Create Account" : "Sign In"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={signInWithGoogle}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.googleButtonText}>
                {isLoading ? "Signing In..." : "Continue with Google"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSigningUp
                ? "Already have an account? "
                : "Don't have an account? "}
            </Text>
            <TouchableOpacity
              onPress={() => setIsSigningUp(!isSigningUp)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>
                {isSigningUp ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme?.background || "#ffffff",
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: theme?.text || "#000000",
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: theme?.textSecondary || "#666666",
      textAlign: "center",
      lineHeight: 22,
    },
    form: {
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 16,
    },
    input: {
      height: 56,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme?.border || "#E0E0E0",
      borderRadius: 12,
      backgroundColor: theme?.surface || "#FFFFFF",
      color: theme?.text || "#000000",
      fontSize: 16,
      fontWeight: "400",
    },
    inputFocused: {
      borderColor: theme?.primary || "#007AFF",
      borderWidth: 2,
    },
    primaryButton: {
      height: 56,
      backgroundColor: theme?.primary || "#007AFF",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      shadowColor: theme?.primary || "#007AFF",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "600",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme?.border || "#E0E0E0",
    },
    dividerText: {
      marginHorizontal: 16,
      color: theme?.textSecondary || "#666666",
      fontSize: 14,
      fontWeight: "500",
    },
    googleButton: {
      height: 56,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme?.darkMode ? "#222" : "#fff",
      borderWidth: 1,
      borderColor: theme?.darkMode ? "#fff" : theme?.border || "#E0E0E0",
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    googleButtonText: {
      color: theme?.googleButtonText || (theme?.dark ? "#000000" : "#000000"),
      fontSize: 16,
      fontWeight: "600",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 16,
    },
    footerText: {
      color: theme?.textSecondary || "#666666",
      fontSize: 16,
    },
    footerLink: {
      color: theme?.primary || "#007AFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default AuthScreen;

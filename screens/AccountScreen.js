import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const AccountScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.profileCircle, { backgroundColor: theme.primary }]}>
        <Text style={styles.profileInitial}>
          {user?.displayName
            ? user.displayName[0].toUpperCase()
            : user?.email
            ? user.email[0].toUpperCase()
            : "U"}
        </Text>
      </View>
      <Text style={[styles.name, { color: theme.text }]}>
        {user?.displayName || "No Name"}
      </Text>
      <Text style={[styles.email, { color: theme.textSecondary }]}>
        {user?.email || "No Email"}
      </Text>
      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: theme.danger }]}
        onPress={signOut}
      >
        <Text style={[styles.signOutText, { color: theme.textInverse }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  profileInitial: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 32,
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AccountScreen;

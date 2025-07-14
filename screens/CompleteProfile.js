import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import firestore from "@react-native-firebase/firestore";
import { lightTheme, darkTheme } from "../constants/themes";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import auth from "@react-native-firebase/auth";

const COLOR_PALETTE = [
  "#6366F1", // Indigo
  "#10B981", // Mint
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#8B5CF6", // Purple
  "#F472B6", // Pink
  "#FBBF24", // Yellow
];

const CompleteProfile = ({ onComplete, onAuthSuccess }) => {
  const { user, refreshUser } = useAuth();
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;
  const [displayName, setDisplayName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!displayName.trim() || !selectedColor) {
      Alert.alert("Missing Info", "Please enter a name and select a color.");
      return;
    }
    setLoading(true);
    try {
      await user.updateProfile({ displayName: displayName.trim() });
      await user.reload();
      await refreshUser();
      await firestore().collection("users").doc(user.uid).set(
        {
          profileColor: selectedColor,
        },
        { merge: true }
      );
      onComplete();
      onAuthSuccess?.();
    } catch (e) {
      Alert.alert("Error", "Could not complete profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Complete Your Profile
      </Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Display Name"
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        autoFocus
      />
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        Choose your icon color
      </Text>
      <FlatList
        data={COLOR_PALETTE}
        horizontal
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.colorCircle,
              {
                backgroundColor: item,
                borderWidth: selectedColor === item ? 3 : 0,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setSelectedColor(item)}
          />
        )}
        contentContainerStyle={{ marginVertical: 16, paddingHorizontal: 8 }}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: selectedColor || theme.primary,
            opacity: loading ? 0.7 : 1,
          },
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text
          style={{ color: theme.textInverse, fontWeight: "700", fontSize: 16 }}
        >
          Continue
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
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 8,
  },
  submitButton: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CompleteProfile;

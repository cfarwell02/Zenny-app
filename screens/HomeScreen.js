import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Zenny!</Text>
      <Button
        title="➕ Add Receipt"
        onPress={() => navigation.navigate("Add Receipt")}
      />

      <Button
        title="📊 View Stats"
        onPress={() => navigation.navigate("Statistics")}
      />

      <Button
        title="⚙️ Settings"
        onPress={() => navigation.navigate("Settings")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: "center",
  },
});

export default HomeScreen;

import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { BudgetContext } from "../context/BudgetContext";

const MyBudgetScreen = () => {
  const { budget, setBudget, threshold, setThreshold } =
    useContext(BudgetContext);
  const [newBudget, setNewBudget] = useState(budget.toString());
  const [newThreshold, setNewThreshold] = useState(threshold.toString());

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.label}>Set Monthly Budget ($):</Text>
        <TextInput
          style={styles.input}
          value={newBudget}
          onChangeText={setNewBudget}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Set Alert Threshold (%):</Text>
        <TextInput
          style={styles.input}
          value={newThreshold}
          onChangeText={setNewThreshold}
          keyboardType="numeric"
        />

        <Button
          title="Save Budget Settings"
          onPress={() => {
            setBudget(Number(newBudget));
            setThreshold(Number(newThreshold));
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default MyBudgetScreen;

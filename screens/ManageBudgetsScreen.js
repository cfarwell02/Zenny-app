import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { BudgetContext } from "../context/BudgetContext";

const ManageBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, updateCategoryBudget, threshold, setThreshold } =
    useContext(BudgetContext);

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [items, setItems] = useState(
    Object.keys(categoryBudgets).map((key) => ({
      label: key,
      value: key,
    }))
  );

  const [newAmount, setNewAmount] = useState(
    categoryBudgets[selectedCategory]?.toString() || ""
  );
  const [newThreshold, setNewThreshold] = useState(threshold.toString());

  const handleSave = () => {
    updateCategoryBudget(selectedCategory, Number(newAmount));
    setThreshold(Number(newThreshold));
    Alert.alert("Saved", `Updated budget for ${selectedCategory}`);
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.label}>Select Category:</Text>

        <DropDownPicker
          open={open}
          value={selectedCategory}
          items={items}
          setOpen={setOpen}
          setValue={(callback) => {
            const value = callback(selectedCategory);
            setSelectedCategory(value);
            setNewAmount(categoryBudgets[value]?.toString() || "");
          }}
          setItems={setItems}
          style={styles.dropdown}
          dropDownContainerStyle={{ zIndex: 1000 }}
        />

        <Text style={styles.label}>Set Budget Amount ($):</Text>
        <TextInput
          style={styles.input}
          value={newAmount}
          onChangeText={setNewAmount}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Set Alert Threshold (%):</Text>
        <TextInput
          style={styles.input}
          value={newThreshold}
          onChangeText={setNewThreshold}
          keyboardType="numeric"
        />

        <Button title="Save Budget Settings" onPress={handleSave} />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ textAlign: "center", color: "blue" }}>
            ← Back to Budget Overview
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, zIndex: 10 },
  label: { fontSize: 16, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdown: {
    marginBottom: 16,
  },
});

export default ManageBudgetScreen;

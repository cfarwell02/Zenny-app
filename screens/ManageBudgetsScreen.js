import React, { useContext, useState, useEffect } from "react";
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
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";

const ManageBudgetScreen = ({ navigation }) => {
  const { categoryBudgets, updateCategoryBudget, threshold, setThreshold } =
    useContext(BudgetContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const updatedItems = Object.keys(categoryBudgets).map((key) => ({
      label: key,
      value: key,
    }));
    setItems(updatedItems);
  }, [categoryBudgets]);

  const [newAmount, setNewAmount] = useState("");
  const [newThreshold, setNewThreshold] = useState(threshold.toString());

  const handleSave = () => {
    if (!selectedCategory) {
      Alert.alert("Missing Info", "Please select a category.");
      return;
    }

    updateCategoryBudget(selectedCategory, Number(newAmount));
    setThreshold(Number(newThreshold));
    console.log("Budget and Threshold Saved.");
    Alert.alert("Saved", `Updated budget for ${selectedCategory}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.label, { color: theme.text }]}>
          Select Category:
        </Text>

        <DropDownPicker
          open={open}
          value={selectedCategory}
          items={items}
          setOpen={setOpen}
          onChangeValue={(value) => {
            setSelectedCategory(value);
            setNewAmount(categoryBudgets[value]?.toString() || ""); // always update
          }}
          setItems={setItems}
          style={[
            styles.dropdown,
            { backgroundColor: theme.input, borderColor: theme.border },
          ]}
          textStyle={{ color: theme.text }}
          dropDownContainerStyle={{
            backgroundColor: theme.input,
            borderColor: theme.border,
            zIndex: 1000,
          }}
        />

        <Text style={[styles.label, { color: theme.text }]}>
          Set Budget Amount ($):
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.input,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          value={newAmount}
          onChangeText={setNewAmount}
          keyboardType="numeric"
        />

        <Text style={[styles.label, { color: theme.text }]}>
          Set Alert Threshold (%):
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.input,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          value={newThreshold}
          onChangeText={setNewThreshold}
          keyboardType="numeric"
        />

        <View style={{ marginTop: 10, marginBottom: 16 }}>
          <Button
            title="Save Budget Settings"
            onPress={handleSave}
            color={theme.primary}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ textAlign: "center", color: theme.text }}>
            ← Back to Budget Overview
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    zIndex: 10,
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdown: {
    marginBottom: 16,
    borderWidth: 1,
  },
});
export default ManageBudgetScreen;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IncomeScreen = () => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [incomeList, setIncomeList] = useState([]);

  const addIncome = () => {
    if (!amount || !source) return;
    const newIncome = {
      id: Date.now().toString(),
      source,
      amount: parseFloat(amount),
    };
    setIncomeList((prev) => [...prev, newIncome]);
    setAmount("");
    setSource("");
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.header}>💼 Income Tracker</Text>
        <TextInput
          placeholder="Source"
          value={source}
          onChangeText={setSource}
          style={styles.input}
        />
        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button title="Add Income" onPress={addIncome} />

        <FlatList
          data={incomeList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text>
              {item.source}: ${item.amount.toFixed(2)}
            </Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
});

export default IncomeScreen;

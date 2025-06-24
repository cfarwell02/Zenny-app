import React, { useContext } from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { ReceiptContext } from "../context/ReceiptContext";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/themes";
import { spacing } from "../constants/spacing";
import { radius } from "../constants/radius";

const SavedReceiptsScreen = () => {
  const { receipts } = useContext(ReceiptContext);
  const { darkMode } = useContext(ThemeContext);
  const theme = darkMode ? darkTheme : lightTheme;

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={{ color: theme.text }}>${item.amount.toFixed(2)}</Text>
      <Text style={{ color: theme.subtleText }}>{item.category}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {receipts.length === 0 ? (
        <Text style={{ color: theme.subtleText, textAlign: "center" }}>
          No receipts saved yet.
        </Text>
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  grid: {
    gap: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default SavedReceiptsScreen;

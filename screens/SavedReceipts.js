import React, { useContext } from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}
    >
      {receipts.length === 0 ? (
        <Text style={{ color: theme.text, textAlign: "center" }}>
          No receipts saved yet.
        </Text>
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={4}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
        />
      )}
    </SafeAreaView>
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
    borderRadius: radius.medium,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 125,
    borderRadius: radius.medium,
    marginBottom: 8,
  },
});

export default SavedReceiptsScreen;

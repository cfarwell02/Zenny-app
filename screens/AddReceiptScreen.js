// 1. Imports
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ActionSheetIOS,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { ReceiptContext } from "../context/ReceiptContext";

// 2. Component
const AddReceiptScreen = () => {
  // 2.1 State
  const [image, setImage] = useState(null);
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([
    { label: "Food", value: "Food" },
    { label: "Shopping", value: "Shopping" },
    { label: "Transport", value: "Transport" },
    { label: "Bills", value: "Bills" },
    { label: "Other", value: "Other" },
  ]);

  // 2.2 Context
  const { addReceipt } = useContext(ReceiptContext);

  // 3. Helper functions
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 4. Main handlers
  const handleInsertPhoto = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await takePhoto();
          if (buttonIndex === 2) await pickImage();
        }
      );
    } else {
      Alert.alert("Insert Photo", "Choose an option", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleSaveReceipt = () => {
    if (!image || !amount || !selectedCategory) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields before saving."
      );
      return;
    }

    const newReceipt = {
      id: Date.now(),
      image,
      amount: parseFloat(amount),
      category: selectedCategory,
      date: new Date().toISOString(),
    };

    addReceipt(newReceipt);
    setImage(null);
    setAmount("");
    setSelectedCategory(null);
    Alert.alert("Success", "Receipt saved successfully!");
  };

  // 5. Return JSX
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inner}>
          <View>
            <Text style={styles.title}>Add a Receipt</Text>

            <TouchableOpacity style={styles.button} onPress={handleInsertPhoto}>
              <Text style={styles.buttonText}>📷 Insert Photo</Text>
            </TouchableOpacity>

            {image && (
              <View style={styles.card}>
                <Image source={{ uri: image }} style={styles.image} />

                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                <View style={{ zIndex: 1000, marginBottom: 16 }}>
                  <DropDownPicker
                    open={open}
                    value={selectedCategory}
                    items={categoryItems}
                    setOpen={setOpen}
                    setValue={setSelectedCategory}
                    setItems={setCategoryItems}
                    placeholder="Select a category..."
                    dropDownDirection="AUTO"
                    dropDownContainerStyle={{
                      borderColor: "#ccc",
                      zIndex: 1000,
                      position: "absolute",
                      top: Platform.OS === "android" ? 50 : 40,
                    }}
                    style={{
                      borderColor: "#ccc",
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          {image && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveReceipt}
            >
              <Text style={styles.saveButtonText}>💾 Save Receipt</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

// 6. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4D90FE",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#34C759",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
});

// 7. Export
export default AddReceiptScreen;

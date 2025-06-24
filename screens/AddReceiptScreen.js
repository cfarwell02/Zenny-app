import React, { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker"; // You may need to install this

const AddReceiptScreen = () => {
  const [image, setImage] = useState(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

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

  return (
    <View style={styles.container}>
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

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select category..." value="" />
              <Picker.Item label="Food" value="Food" />
              <Picker.Item label="Shopping" value="Shopping" />
              <Picker.Item label="Transport" value="Transport" />
              <Picker.Item label="Bills" value="Bills" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: "100%",
  },
});

export default AddRecieptScreen;

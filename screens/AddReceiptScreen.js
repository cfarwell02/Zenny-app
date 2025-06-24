import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  ActionSheetIOS, // iOS-specific popup menu
  Platform,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const AddRecieptScreen = () => {
  const [image, setImage] = React.useState(null);

  // Function to handle inserting a photo
  const handleInsertPhoto = async () => {
    if (Platform.OS === "ios") {
      // Show iOS action sheet
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
      // Show Android alert menu
      Alert.alert("Insert Photo", "Choose an option", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  //Take a photo using the camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  //Pick an image from the library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your camera roll.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
    });

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

      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
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
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  image: {
    width: "100%",
    height: 300,
    marginTop: 20,
    borderRadius: 8,
  },
});

export default AddRecieptScreen;

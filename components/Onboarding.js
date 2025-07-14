import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography } from "../constants/typography";
import { spacing } from "../constants/spacing";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "welcome",
    title: "Welcome to Zenny!",
    description:
      "Your all-in-one app for tracking receipts, budgets, and savings goals.",
    image: require("../assets/icon.png"),
  },
  {
    key: "receipts",
    title: "Track Every Receipt",
    description:
      "Easily add, categorize, and manage your expenses. Attach photos for better record-keeping.",
    image: require("../assets/splash-icon.png"),
  },
  {
    key: "budgets",
    title: "Set Budgets & Goals",
    description:
      "Create monthly budgets, set savings goals, and monitor your progress with clear dashboards.",
    image: require("../assets/adaptive-icon.png"),
  },
  {
    key: "recurring",
    title: "Recurring & Cloud Sync",
    description:
      "Handle subscriptions and recurring expenses. All your data is securely synced to the cloud.",
    image: require("../assets/icon.png"),
  },
  {
    key: "export",
    title: "Export & Analyze",
    description:
      "Export your data as CSV, JSON, or PDF for deeper analysis or backup.",
    image: require("../assets/splash-icon.png"),
  },
];

export default function Onboarding({ onFinish }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.slide}>
        <Image source={slide.image} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (isLast) onFinish();
          else setIndex(index + 1);
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{isLast ? "Get Started" : "Next"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: width - spacing.lg * 2,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    textAlign: "center",
    marginBottom: spacing.md,
    color: "#222",
  },
  description: {
    fontSize: typography.lg,
    textAlign: "center",
    color: "#555",
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#6366F1",
    width: 16,
  },
  button: {
    backgroundColor: "#6366F1",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  buttonText: {
    color: "#fff",
    fontSize: typography.lg,
    fontWeight: typography.bold,
  },
});

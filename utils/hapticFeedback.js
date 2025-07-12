// Simplified haptic feedback utility (no expo-haptics dependency)
// This version provides the same API but without actual haptic feedback
// to avoid build issues with expo-haptics

// Light impact for subtle feedback (buttons, toggles)
export const lightHaptic = () => {
  // No-op for now to avoid build issues
  console.log("Haptic feedback: light");
};

// Medium impact for more noticeable feedback (success actions, selections)
export const mediumHaptic = () => {
  // No-op for now to avoid build issues
  console.log("Haptic feedback: medium");
};

// Heavy impact for important actions (errors, warnings)
export const heavyHaptic = () => {
  // No-op for now to avoid build issues
  console.log("Haptic feedback: heavy");
};

// Success notification haptic
export const successHaptic = () => {
  // No-op for now to avoid build issues
  console.log("Haptic feedback: success");
};

// Warning notification haptic
export const warningHaptic = () => {
  // No-op for now to avoid build issues
  console.log("Haptic feedback: warning");
};

// Error notification haptic
export const errorHaptic = () => {
  // No-op for now to avoid build issues
  console.log("Haptic feedback: error");
};

// Selection haptic for pickers, sliders
export const selectionHaptic = () => {
  // No-op for now to avoid build issues
  console.log("Haptic feedback: selection");
};

// Custom haptic patterns for specific actions
export const hapticPatterns = {
  // Receipt scanned successfully
  receiptScanned: () => {
    successHaptic();
    setTimeout(() => lightHaptic(), 100);
  },

  // Budget exceeded
  budgetExceeded: () => {
    warningHaptic();
    setTimeout(() => mediumHaptic(), 150);
  },

  // Goal achieved
  goalAchieved: () => {
    successHaptic();
    setTimeout(() => successHaptic(), 200);
  },

  // Data exported
  dataExported: () => {
    mediumHaptic();
    setTimeout(() => lightHaptic(), 100);
  },

  // Error occurred
  errorOccurred: () => {
    errorHaptic();
  },
};

// Professional Typography System
// Consistent with modern design systems

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,

  // Font weights
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",

  // Line heights
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

// Semantic text styles
export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.display,
    fontWeight: typography.bold,
    lineHeight: typography.tight,
  },
  h2: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    lineHeight: typography.tight,
  },
  h3: {
    fontSize: typography.xxl,
    fontWeight: typography.semibold,
    lineHeight: typography.normal,
  },
  h4: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    lineHeight: typography.normal,
  },

  // Body text
  body: {
    fontSize: typography.base,
    fontWeight: typography.normal,
    lineHeight: typography.relaxed,
  },
  bodyLarge: {
    fontSize: typography.lg,
    fontWeight: typography.normal,
    lineHeight: typography.relaxed,
  },
  bodySmall: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    lineHeight: typography.relaxed,
  },

  // Captions and labels
  caption: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    lineHeight: typography.normal,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    lineHeight: typography.normal,
  },

  // Interactive elements
  button: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    lineHeight: typography.normal,
  },
  buttonSmall: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    lineHeight: typography.normal,
  },

  // Special text
  display: {
    fontSize: typography.display,
    fontWeight: typography.extrabold,
    lineHeight: typography.tight,
  },
  monospace: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    lineHeight: typography.normal,
    fontFamily: "monospace",
  },
};

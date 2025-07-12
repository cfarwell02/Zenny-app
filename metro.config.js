const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Disable type stripping completely
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    compress: {
      keep_fnames: true,
      drop_console: false,
    },
  },
  // Disable TypeScript stripping
  experimentalImportSupport: false,
  inlineRequires: true,
};

// Exclude problematic files from transformation
config.resolver.platforms = ["ios", "android", "native", "web"];
config.resolver.sourceExts = ["js", "jsx", "json", "ts", "tsx"];

module.exports = config;

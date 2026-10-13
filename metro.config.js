const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v10+ has a broken exports map that causes:
// "Component auth has not been registered yet"
// Disabling package exports forces Metro to use file-based CJS resolution instead.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
// The knowledge pack is bundled as an asset (see scripts/sync-pack.ts).
config.resolver.assetExts.push('sqlite');

module.exports = withNativeWind(config, { input: './global.css' });

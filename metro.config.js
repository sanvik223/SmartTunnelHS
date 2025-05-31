const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig();
  const { assetExts } = config.resolver;
  config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
  config.transformer = {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  return config;
})();

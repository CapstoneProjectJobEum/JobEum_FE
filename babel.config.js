module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          safe: false,
          allowUndefined: true
        }
      ],
      'react-native-worklets/plugin' // 반드시 마지막 플러그인
    ],
  };
};

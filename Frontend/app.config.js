import dotenv from "dotenv";
dotenv.config(); // This loads the variables from the .env file

export default {
  expo: {
    name: "project",
    slug: "project",
    version: "1.0.0",
    orientation: "portrait",
    logo: "./assets/logo.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY, // Using the environment variable here
        },
      },
    },
    permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-asset"],
  },
};

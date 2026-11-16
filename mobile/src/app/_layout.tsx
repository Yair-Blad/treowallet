
import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";

export default function RootLayout() {
  useEffect(() => {
    const enablePrivacyProtection = async () => {
      try {
        if (Platform.OS === "android") {
          await ScreenCapture.preventScreenCaptureAsync(
            "treo-wallet"
          );
        }

        if (Platform.OS === "ios") {
          await ScreenCapture.enableAppSwitcherProtectionAsync(1);
        }
      } catch (error) {
        console.error(
          "Error al activar la protección de privacidad:",
          error
        );
      }
    };

    enablePrivacyProtection();

    return () => {
      if (Platform.OS === "android") {
        ScreenCapture.allowScreenCaptureAsync("treo-wallet")
          .catch(console.error);
      }

      if (Platform.OS === "ios") {
        ScreenCapture.disableAppSwitcherProtectionAsync()
          .catch(console.error);
      }
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

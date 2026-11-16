
import { NativeTabs } from "expo-router/native-tabs";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="house.fill"
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="safari.fill"
          md="explore"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="transfers">
        <NativeTabs.Trigger.Label>Transferencias</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="arrow.left.arrow.right"
          md="swap_horiz"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

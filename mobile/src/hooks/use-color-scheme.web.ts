
import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * Obtiene el esquema de color del dispositivo.
 * Utiliza light como valor predeterminado.
 */
export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  return colorScheme ?? "light";
}

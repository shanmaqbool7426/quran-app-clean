import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

export function useColors() {
  const { isDarkMode } = useApp();
  const palette = isDarkMode ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}

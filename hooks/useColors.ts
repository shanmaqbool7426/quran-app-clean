import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

export function useColors() {
  let isDarkMode = false;
  try {
    const context = useApp();
    isDarkMode = context.isDarkMode;
  } catch (e) {
    // Fallback to light mode if context is missing (e.g. in ErrorBoundary)
    isDarkMode = false;
  }

  const palette = isDarkMode ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}


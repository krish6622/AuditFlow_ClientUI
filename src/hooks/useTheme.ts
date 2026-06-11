import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "ea.theme";

/** Light/dark theme, persisted and applied as the `dark` class on <html>. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(KEY) as Theme | null) ?? "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    []
  );

  return { theme, toggle };
}

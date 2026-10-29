import React, { createContext, useContext, useEffect, useState } from "react";

export const PALETTES = [
  {
    id: "netflix-dark",
    name: "Netflix Crimson Dark",
    desc: "Iconic Netflix Red (#E50914) with pitch-black OLED background and dark glassmorphic cards",
    primary: "#E50914",
    accent: "#b81d24",
    bg: "#141414",
    cardBg: "#181818",
    badge: "Flagship",
    category: "dark"
  },
  {
    id: "light",
    name: "Soft Iris & Indigo",
    desc: "Modern SaaS aesthetic with crisp white cards and soft lavender-slate backdrop",
    primary: "#4f46e5",
    accent: "#06b6d4",
    bg: "#f8fafc",
    cardBg: "#ffffff",
    badge: "Default",
    category: "light"
  },
  {
    id: "dark",
    name: "Nebula Dark Slate",
    desc: "Deep obsidian slate with glowing electric cyber accents for night work",
    primary: "#3b82f6",
    accent: "#06b6d4",
    bg: "#080c14",
    cardBg: "#0f172a",
    badge: "Night",
    category: "dark"
  },
  {
    id: "light-emerald",
    name: "Emerald & Clean Mint",
    desc: "Fresh botanical green with soothing mint-ice tones and clean high contrast",
    primary: "#059669",
    accent: "#10b981",
    bg: "#f2f9f6",
    cardBg: "#ffffff",
    badge: "Fresh",
    category: "light"
  },
  {
    id: "light-coral",
    name: "Sunset Coral & Amber",
    desc: "Warm peach undertones with radiant terracotta and golden honey accents",
    primary: "#ea580c",
    accent: "#f43f5e",
    bg: "#fdf8f6",
    cardBg: "#ffffff",
    badge: "Warm Luxe",
    category: "light"
  },
  {
    id: "light-nordic",
    name: "Nordic Frost & Sky",
    desc: "Crisp arctic ice mist with deep cobalt blue and sky cyan elements",
    primary: "#0284c7",
    accent: "#38bdf8",
    bg: "#f0f5fa",
    cardBg: "#ffffff",
    badge: "Minimal",
    category: "light"
  }
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("churnwise_theme");
    if (saved) {
      const exists = PALETTES.some((p) => p.id === saved);
      if (exists) return saved;
    }
    return "netflix-dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("churnwise_theme", theme);
  }, [theme]);

  const isDark = theme.includes("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev.includes("dark") ? "light" : "netflix-dark"));
  };

  const setPalette = (paletteId) => {
    setTheme(paletteId);
  };

  const currentPalette = PALETTES.find((p) => p.id === theme) || PALETTES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        setPalette,
        toggleTheme,
        isDark,
        currentPalette,
        palettes: PALETTES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

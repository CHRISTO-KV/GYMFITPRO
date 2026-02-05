import { createContext, useState, useMemo, useContext, useEffect } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
    // Load saved mode from localStorage or default to 'dark'
    const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "dark");

    const toggleColorMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === "light" ? "dark" : "light";
            localStorage.setItem("themeMode", newMode);
            return newMode;
        });
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === "dark"
                        ? {
                            // Dark Mode Palette
                            primary: { main: "#ffeb3b" }, // ACCENT
                            background: { default: "#000000", paper: "#1a1a1a" },
                            text: { primary: "#ffffff", secondary: "#b0b0b0" },
                        }
                        : {
                            // Light Mode Palette
                            primary: { main: "#fbc02d" }, // Darker yellow for better contrast on white
                            background: { default: "#f5f5f5", paper: "#ffffff" },
                            text: { primary: "#000000", secondary: "#555555" },
                        }),
                },
                typography: {
                    fontFamily: "'Inter', sans-serif",
                    h1: { fontWeight: 800 },
                    h2: { fontWeight: 700 },
                    h3: { fontWeight: 700 },
                    button: { fontWeight: 700, textTransform: "none" },
                },
                components: {
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                backgroundColor: mode === "dark" ? "#1e1e1e" : "#ffffff",
                                color: mode === "dark" ? "#ffffff" : "#000000",
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleColorMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

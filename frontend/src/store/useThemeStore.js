import { create } from 'zustand'; // Correct way to import 'create' from zustand

export const useThemeStore = create((set) => ({
    theme: "coffee",  // default theme initially
    setTheme: (theme) => {
        try {
            localStorage.setItem("chat-theme", theme);
        } catch (error) {
            console.error("Failed to save theme:", error);
        }
        set({
            theme
        });
    },
    hydrate: () => {
        try {
            const storedTheme = localStorage.getItem("chat-theme");
            if (storedTheme) {
                set({
                    theme: storedTheme
                });
            }
        } catch (error) {
            console.error("Failed to retrieve theme:", error);
        }
    }
}));

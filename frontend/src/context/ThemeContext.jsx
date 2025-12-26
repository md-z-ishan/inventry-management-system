import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext({
    mode: 'dark',
    toggleColorMode: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode || 'dark';
    });

    const toggleColorMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: '#f97316', // Orange 500
                        light: '#fb923c',
                        dark: '#c2410c',
                        contrastText: '#ffffff',
                    },
                    secondary: {
                        main: '#3b82f6', // Blue 500
                        light: '#60a5fa',
                        dark: '#1d4ed8',
                        contrastText: '#ffffff',
                    },
                    background: {
                        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
                        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
                    },
                    text: {
                        primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
                        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
                    },
                    success: { main: '#10b981' },
                    warning: { main: '#f59e0b' },
                    error: { main: '#ef4444' },
                    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                typography: {
                    fontFamily: '"Inter", "Outfit", sans-serif',
                    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
                    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
                    h3: { fontWeight: 600, letterSpacing: '-0.025em' },
                    h4: { fontWeight: 600, letterSpacing: '-0.025em' },
                    h5: { fontWeight: 600 },
                    h6: { fontWeight: 600 },
                    button: { textTransform: 'none', fontWeight: 500 },
                },
                shape: {
                    borderRadius: 16,
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                scrollbarColor: mode === 'dark' ? "#6b7280 #1e293b" : "#9ca3af #f1f5f9",
                                "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                                    backgroundColor: mode === 'dark' ? "#1e293b" : "#f1f5f9",
                                },
                                "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                                    borderRadius: 8,
                                    backgroundColor: mode === 'dark' ? "#6b7280" : "#9ca3af",
                                    minHeight: 24,
                                    border: mode === 'dark' ? "3px solid #1e293b" : "3px solid #f1f5f9",
                                },
                                "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
                                    backgroundColor: mode === 'dark' ? "#9ca3af" : "#6b7280",
                                },
                                "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
                                    backgroundColor: mode === 'dark' ? "#9ca3af" : "#6b7280",
                                },
                                "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                                    backgroundColor: mode === 'dark' ? "#9ca3af" : "#6b7280",
                                },
                                "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                                    backgroundColor: mode === 'dark' ? "#2b2b2b" : "#e2e8f0",
                                },
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: '12px',
                                boxShadow: 'none',
                                padding: '10px 20px',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                                },
                            },
                            containedPrimary: {
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: '20px',
                                boxShadow: mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.05)',
                                border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                                background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(12px)',
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.4)',
                                    '& fieldset': {
                                        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                    },
                                }
                            }
                        }
                    },
                    MuiTableCell: {
                        styleOverrides: {
                            root: {
                                borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                            },
                            head: {
                                color: mode === 'dark' ? '#94a3b8' : '#64748b',
                                backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#f1f5f9',
                            },
                        }
                    }
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleColorMode }}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};

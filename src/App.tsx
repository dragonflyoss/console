import Main from './layouts/main';
import { createTheme, ThemeProvider } from '@mui/material';
import { createContext, useEffect, useMemo, useState } from 'react';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const dataTheme = localStorage.getItem('data-theme');
    return (dataTheme as 'light' | 'dark') || 'dark';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);

    localStorage.setItem('data-theme', mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#1C293A' : 'rgba(255, 255, 255, 0.8)',
          },
          text: {
            primary: mode === 'light' ? '#1C293A' : 'rgba(255, 255, 255, 0.8)',
          },
          success: {
            main: '#087667',
            light: '#087667',
            dark: '#087667',
          },
          warning:{
            main:'#ffcb31'
          },
          secondary: {
            main: '#087667',
            light: '#087667',
            dark: '#087667',
          },
        },
        typography: {
          fontFamily: 'mabry-light',
        },
        components: {
          MuiDialog: {
            styleOverrides: {
              paper: {
                backgroundColor: 'var(--palette-profile-background-paper)',
                backgroundImage: 'none',
              },
            },
          },
          MuiAlert: {
            defaultProps: {
              variant: 'filled',
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Main />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

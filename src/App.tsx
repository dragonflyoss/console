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
            main: mode === 'light' ? '#1f7d53' : '#008170',
          },
        },
        typography: {
          fontFamily: 'mabry-light',
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

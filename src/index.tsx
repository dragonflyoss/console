import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Routers } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const theme = createTheme({
  typography: {
    fontFamily: 'mabry-light,sans-serif',
  },
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Routers>
        <App />
      </Routers>
    </ThemeProvider>
  </React.StrictMode>,
);

reportWebVitals();

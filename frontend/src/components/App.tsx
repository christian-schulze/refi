import { ThemeProvider } from '@emotion/react';

import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';

import { stores, StoresProvider } from 'stores';
import { baseDarkTheme } from 'themes/darkTheme';

import { GlobalStyles } from './GlobalStyles';
import { Routes } from './Routes';

const muiTheme = createTheme(baseDarkTheme);

export const App = () => {
  return (
    <>
      <iframe
        src="/hiddenIframe.html"
        style={{ position: 'absolute', visibility: 'hidden' }}
      />
      <StoresProvider value={stores}>
        <ThemeProvider theme={baseDarkTheme}>
          <MuiThemeProvider theme={muiTheme}>
            <GlobalStyles />
            <Routes />
          </MuiThemeProvider>
        </ThemeProvider>
      </StoresProvider>
    </>
  );
};

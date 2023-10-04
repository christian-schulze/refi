import '@emotion/react'

declare module '@emotion/react' {
  export interface Theme {
    palette: {
      type: string;
      primary: {
        main: string;
      },
      secondary: {
        main: string;
      },
      background: {
        default: string;
        paper: string;
      },
      text: {
        primary: string;
        secondary: string;
        disabled: string;
        hint: string;
      },
      divider: string;
    },
    typography: {
      fontFamily: string;
    },
  }
}

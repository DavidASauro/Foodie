// theme.ts
import { createTheme, darken, lighten } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    card: {
      main: string;
    };
  }
  interface PaletteOptions {
    card?: {
      main: string;
    };
  }
}

export const getAppTheme = (mode: "light" | "dark") => {
  const base = createTheme({ palette: { mode } });
  return createTheme(base, {
    palette: {
      card: {
        main:
          mode === "dark"
            ? lighten(base.palette.background.default, 0.05)
            : darken(base.palette.background.default, 0.05),
      },
    },
  });
};

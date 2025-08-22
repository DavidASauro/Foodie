import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import Voting from "./pages/Voting";
import Results from "./pages/Results";
import PreferencesRoomView from "./components/PreferencesRoomView";
import { CssBaseline, Switch, ThemeProvider } from "@mui/material";
import { getAppTheme } from "./themes/theme";
import type { Theme } from "@mui/material/styles";

const App = () => {
  const [toggleDarkMode, setToggleDarkMode] = useState(true);
  const theme: Theme = getAppTheme(toggleDarkMode ? "dark" : "light");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <Switch
          checked={toggleDarkMode}
          onChange={() => setToggleDarkMode(!toggleDarkMode)}
        />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/results" element={<Results />} />
        <Route path="/preferences" element={<PreferencesRoomView />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
